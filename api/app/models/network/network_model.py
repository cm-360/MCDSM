from __future__ import annotations

from dataclasses import dataclass
from dataclasses import field

from ..base import Serializable


@dataclass
class Network(Serializable):

    id: str

    # Config from network.json
    display_name: str

    # Runtime attributes
    directory: str
    network_id: str = None
    servers: dict[str, Server] = field(default_factory=dict)
