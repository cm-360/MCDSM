from dataclasses import dataclass

from ..base import Serializable


@dataclass
class ServerConfig(Serializable):

    id: str

    # Config from server.json
    display_name: str
    template: bool
    jvm_image: str
    jvm_arguments: list[str]
    jar_executable: str
    jar_arguments: list[str]
    resources: str