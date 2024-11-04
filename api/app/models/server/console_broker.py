from __future__ import annotations

import asyncio
import os

from typing import AsyncGenerator


class ConsoleBroker:

    # https://quart.palletsprojects.com/en/latest/tutorials/chat_tutorial.html

    def __init__(self) -> None:
        self.connections = set()
        self.socket = None

    def set_socket(self, socket) -> None:
        self.socket = socket

    # TODO make this function async
    def start_socket_listener(self):
        loop = asyncio.get_running_loop()
        loop.create_task(asyncio.to_thread(self._socket_listener))

    def _socket_listener(self):
        # TODO unblock on exit
        while True:
            if self.socket is None:
                break
            data = self.socket.read(1024)
            if 0 == len(data):
                break
            for connection in self.connections:
                connection.put_nowait(data.decode('utf-8'))

    async def send(self, command: str) -> None:
        # TODO error
        if self.socket is None:
            return
        os.write(self.socket.fileno(), command.encode('utf-8'))

    async def subscribe(self) -> AsyncGenerator[str, None]:
        connection = asyncio.Queue()
        self.connections.add(connection)
        try:
            while True:
                yield await connection.get()
        finally:
            self.connections.remove(connection)
