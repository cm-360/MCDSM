from dataclasses import dataclass

from ..base import Serializable
from .resource import Resource


@dataclass
class Collection(Serializable):

    id: str

    # Config from collection.json
    display_name: str
    path: str
    extension: str

    resources: list[Resource]
