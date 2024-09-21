from __future__ import annotations

import asyncio
import os

from dataclasses import dataclass
from dataclasses import field
from typing import AsyncGenerator
from typing import Optional


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


class Serializable:

    def to_dict(self):
        result = {}
        for key, value in self.__dict__.items():
            if not key.startswith("_"):
                if hasattr(value, "to_dict"):
                    result[key] = value.to_dict()
                else:
                    result[key] = value
        return result

@dataclass
class Server(Serializable):

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
    _network: Network
    _container = None
    _console: ConsoleBroker = field(default_factory=ConsoleBroker)

    def to_dict(self):
        result = super().to_dict()

        if self._container is not None:
            self._container.reload()
            result['container'] = {
                'id': self._container.id,
                'running': 'running' == self._container.status,
            }

        return result


@dataclass
class Network:

    id: str

    # Config from network.json
    display_name: str

    # Runtime attributes
    directory: str
    network_id: str = None
    servers: dict[str, Server] = field(default_factory=dict)
