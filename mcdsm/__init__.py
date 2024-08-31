import asyncio
import os

import docker
from quart import Quart
from quart import websocket
from quart import render_template

from mcdsm.manager import Manager


app = Quart(__name__)

# /var/run/docker.sock:/var/run/docker.sock
# https://maze88.dev/docker-socket-from-within-containers.html

# https://hub.docker.com/_/amazoncorretto
# https://fabricmc.net/use/server/

# https://docs.cubxity.dev/docs/unifiedmetrics/intro


@app.route('/')
async def page_home():
    return await render_template('home.html')

# Networks

@app.route('/api/networks/<network_id>')
async def api_network_info(network_id: str):
    return ''

# Servers

@app.route('/api/networks/<network_id>/servers/<server_id>')
async def api_server_info(network_id: str, server_id: str):
    server = app.manager.networks[network_id].servers[server_id]
    return server.to_dict()

@app.route('/api/networks/<network_id>/servers/<server_id>/start')
async def api_start_server(network_id: str, server_id: str):
    server = app.manager.networks[network_id].servers[server_id]
    app.manager.start_server(server)
    return ''

@app.route('/api/networks/<network_id>/servers/<server_id>/stop')
async def api_stop_server(network_id: str, server_id: str):
    server = app.manager.networks[network_id].servers[server_id]
    app.manager.stop_server(server)
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
    server = app.manager.networks[network_id].servers[server_id]

    try:
        task = asyncio.ensure_future(_receive(server.console))
        async for data in server.console.subscribe():
            await websocket.send(data)
    finally:
        task.cancel()
        await task


@app.before_serving
async def app_initialize():
    # Create Docker client and container manager
    docker_client = docker.from_env()
    app.manager = Manager(docker_client)
    app.manager.load_networks()

@app.after_serving
async def app_cleanup():
    pass

# Development entrypoint
def run():
    app.run()
