import asyncio
import os

from typing import AsyncGenerator


class ConsoleBroker:

    # https://quart.palletsprojects.com/en/latest/tutorials/chat_tutorial.html

    def __init__(self, server_manager) -> None:
        self.connections = set()
        self.server_manager = server_manager
        self.listener_task = None

    # TODO make this function async
    def start_socket_listener(self) -> None:
        loop = asyncio.get_running_loop()
        self.listener_task = loop.create_task(asyncio.to_thread(self._socket_listener))

    def _socket_listener(self) -> None:
        # TODO unblock on exit
        # TODO keep listener running and re-attach socket on container start (event? lock?)
        while True:
            if self.server_manager.socket is None or self.server_manager.socket.closed:
                break
            data = self.server_manager.socket.read(1024)
            if 0 == len(data):
                break
            for connection in self.connections:
                connection.put_nowait(data.decode('utf-8'))

    async def send(self, command: str) -> None:
        if self.server_manager.socket is None:
            return  # TODO error
        os.write(self.server_manager.socket.fileno(), command.encode('utf-8'))
        self.server_manager.socket.flush()

    async def subscribe(self, include_logs: bool=False) -> AsyncGenerator[str, None]:
        if self.listener_task is None or self.listener_task.done():
            self.start_socket_listener()

        connection = asyncio.Queue()
        self.connections.add(connection)

        if include_logs:
            yield self.server_manager.container.logs().decode('utf-8')

        try:
            while True:
                yield await connection.get()
        finally:
            self.connections.remove(connection)
