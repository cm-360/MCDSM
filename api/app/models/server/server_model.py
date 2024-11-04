from __future__ import annotations

from dataclasses import dataclass
from dataclasses import field

from ..base import Serializable
from .console_broker import ConsoleBroker


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
