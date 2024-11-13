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
        while True:
            if self.server_manager.socket is None:
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

    async def subscribe(self) -> AsyncGenerator[str, None]:
        if self.listener_task is None:
            self.start_socket_listener()

        connection = asyncio.Queue()
        self.connections.add(connection)
        try:
            while True:
                yield await connection.get()
        finally:
            self.connections.remove(connection)
