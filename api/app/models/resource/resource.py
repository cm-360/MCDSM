from dataclasses import dataclass

from ..base import Serializable


@dataclass
class Resource(Serializable):

    name: str
    version: str
