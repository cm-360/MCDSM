from __future__ import annotations

import asyncio
import os

from dataclasses import dataclass
from dataclasses import field
from typing import AsyncGenerator
from typing import Optional


@dataclass
class Server:

    id: str

    # Config from server.json
    display_name: str
    template: bool
    jvm_image: str
    jvm_arguments: list[str]
    jar_executable: str
    jar_arguments: list[str]
    resources: str

    # Runtime attributes
    directory: str
    network: Network
    container = None
    console: Optional[ConsoleBroker] = None

    def to_dict(self):
        return {}


class ConsoleBroker:

    # https://quart.palletsprojects.com/en/latest/tutorials/chat_tutorial.html

    def __init__(self, socket) -> None:
        self.socket = socket
        self.connections = set()

    # TODO make this function async
    def start_socket_listener(self):
        loop = asyncio.get_running_loop()
        loop.create_task(asyncio.to_thread(self._socket_listener))

    def _socket_listener(self):
        while True:
            data = os.read(self.socket.fileno(), 1024)
            if 0 == len(data):
                break
            for connection in self.connections:
                connection.put_nowait(data.decode('utf-8'))

    async def send(self, command: str) -> None:
        os.write(self.socket.fileno(), command.encode('utf-8'))

    async def subscribe(self) -> AsyncGenerator[str, None]:
        connection = asyncio.Queue()
        self.connections.add(connection)
        try:
            while True:
                yield await connection.get()
        finally:
            self.connections.remove(connection)


@dataclass
class Network:

    id: str

    # Config from network.json
    display_name: str

    # Runtime attributes
    directory: str
    servers: dict[str, Server] = field(default_factory=dict)
