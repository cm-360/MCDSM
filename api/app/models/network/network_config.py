from dataclasses import dataclass

from ..base import Serializable


@dataclass
class NetworkConfig(Serializable):

    id: str

    # Config from network.json
    display_name: str
