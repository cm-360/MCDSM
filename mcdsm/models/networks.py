from __future__ import annotations

from dataclasses import dataclass
from dataclasses import field
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

    def to_dict(self):
        return {}


@dataclass
class Network:

    id: str

    # Config from network.json
    display_name: str

    # Runtime attributes
    directory: str
    servers: dict[str, Server] = field(default_factory=dict)
