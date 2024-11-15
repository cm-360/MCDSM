import asyncio
import os
from pathlib import Path
from traceback import format_exception

# Docker client
import docker
# Quart
from quart import Quart
from quart import send_from_directory
from quart import websocket
# Werkzeug
from werkzeug.exceptions import HTTPException

from .manager import DockerManager


app = Quart(__name__,
    static_folder='webui',
)

app.config['TEMPLATES_AUTO_RELOAD'] = True

# /var/run/docker.sock:/var/run/docker.sock
# https://maze88.dev/docker-socket-from-within-containers.html

# https://hub.docker.com/_/amazoncorretto
# https://fabricmc.net/use/server/

# https://docs.cubxity.dev/docs/unifiedmetrics/intro


# Networks

@app.route('/api/networks/<network_id>')
async def api_network_info(network_id: str):
    network = app.manager.get_network_manager(network_id)
    if network is None:
        return api_error_generic('Not Found', f'Network: {network_id}', 404)
    return network.to_dict()

@app.route('/api/networks/<network_id>/servers')
async def api_network_servers(network_id: str):
    network = app.manager.get_network_manager(network_id)
    if network is None:
        return api_error_generic('Not Found', f'Network: {network_id}', 404)
    return [{
        'id': s.id,
        'display_name': s.config.display_name,
    } for s in network.servers.values()]

# Servers

@app.route('/api/networks/<network_id>/servers/<server_id>')
async def api_server_info(network_id: str, server_id: str):
    server = app.manager.get_server_manager(network_id, server_id)
    if server is None:
        return api_error_generic('Not Found', f'Network: {network_id}, Server: {server_id}', 404)
    return server.to_dict()

@app.route('/api/networks/<network_id>/servers/<server_id>/start')
async def api_start_server(network_id: str, server_id: str):
    server = app.manager.get_server_manager(network_id, server_id)
    if server is None:
        return api_error_generic('Not Found', f'Network: {network_id}, Server: {server_id}', 404)
    server.start_container()
    return ''

@app.route('/api/networks/<network_id>/servers/<server_id>/stop')
async def api_stop_server(network_id: str, server_id: str):
    server = app.manager.get_server_manager(network_id, server_id)
    if server is None:
        return api_error_generic('Not Found', f'Network: {network_id}, Server: {server_id}', 404)
    server.stop_container()
    return ''


# https://quart.palletsprojects.com/en/latest/how_to_guides/websockets.html#sending-and-receiving-independently
# https://quart.palletsprojects.com/en/latest/tutorials/chat_tutorial.html

async def _receive(console) -> None:
    while True:
        command = await websocket.receive()
        await console.send(command)
    # except asyncio.CancelledError:

@app.websocket('/api/networks/<network_id>/servers/<server_id>/console')
async def api_server_console(network_id: str, server_id: str):
    server = app.manager.get_server_manager(network_id, server_id)
    if server is None:
        return api_error_generic('Not Found', f'Network: {network_id}, Server: {server_id}', 404)

    include_logs = bool(websocket.args.get('include_logs', False))

    try:
        task = asyncio.ensure_future(_receive(server.console))
        async for data in server.console.subscribe(include_logs=include_logs):
            await websocket.send(data)
    finally:
        task.cancel()
        await task

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
async def serve(path: str):
    """
    Serves the web interface's static build files.

    If a specific path is provided and the corresponding file exists in the static
    folder, it serves that file. Otherwise, serves `index.html`.

    Parameters:
    - path (str): The path to the static file.

    See Also:
    - https://stackoverflow.com/a/45634550
    """
    if path != '' and Path(app.static_folder, path).exists():
        return await send_from_directory(app.static_folder, path)
    else:
        return await send_from_directory(app.static_folder, 'index.html')


########## Error Handling ##########

def api_error_generic(message: str, details: str, code: int=500):
    """
    JSON response template detailing a generic error.

    Parameters:
    - message (str): A title or short error summary message
    - details (str): Extra details about the error
    - code (int): The associated HTTP status code (default is 500)
    """
    return {
        'error': {
            'code': code,
            'message': message,
            'details': details,
        }
    }, code

def api_error_exception(e: Exception, code: int=500):
    """
    JSON response template for an error caused by an exception.

    Parameters:
    - e (Exception): The exception causing the error
    - code (int): The associated HTTP status code (default is 500)
    """
    return api_error_generic(
        str(type(e).__name__),
        str(e),
        code=code,
    )

@app.errorhandler(Exception)
async def handle_exception(e: Exception):
    """
    Handler for any uncaught exceptions in the app.

    Exceptions and their tracebacks are logged as an error, and a JSON error response is
    returned to the client. HTTP errors will not be processed and are instead passed
    through to the client.

    Parameters:
    - e (Exception): The uncaught exception
    """
    # Pass through HTTP errors
    # TODO unless on an API route
    if isinstance(e, HTTPException):
        return e

    # Log exception and traceback
    app.logger.error('Uncaught exception')
    for line in format_exception(type(e), e, e.__traceback__):
        app.logger.error(line.rstrip('\n'))

    # Return JSON response
    return api_error_exception(e)


########## Initialization / Cleanup ##########

@app.before_serving
async def app_initialize() -> None:
    # Create Docker client and container manager
    docker_client = docker.from_env()
    app.manager = DockerManager(docker_client)

@app.after_serving
async def app_cleanup() -> None:
    # Close server sockets
    for network in app.manager.networks.values():
        for server in network.servers.values():
            server.close_socket()


# Development entrypoint
def run() -> None:
    app.run()
