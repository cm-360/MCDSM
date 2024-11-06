from __future__ import annotations

import json
import os

from ..base import Serializable
from ..server.server_manager import ServerManager
from .network_config import NetworkConfig

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .. import DockerManager


class NetworkManager(Serializable):

    def __init__(self, docker_manager: DockerManager, directory: str) -> None:
        self.docker_manager = docker_manager
        self.directory = directory
        self.id = os.path.basename(self.directory)
        self.load_config()
        self.load_servers()

    def load_config(self) -> None:
        # Read network.json config file
        config_file_path = os.path.join(self.directory, 'network.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            # Instantiate NetworkConfig object from config
            self.config = NetworkConfig(
                id=self.id,
                display_name=config['display_name'],
            )

    def load_servers(self) -> None:
        self.servers = {}

        servers_directory = os.path.join(self.directory, 'servers')

        for entry in os.listdir(servers_directory):
            # Full path to entry
            entry_path = os.path.join(servers_directory, entry)

            # Skip non-directories
            if not os.path.isdir(entry_path):
                continue

            # Create ServerManager instance
            server = ServerManager(self, entry_path)
            self.servers[server.id] = server

    @property
    def network(self):
        pass
        # docker_networks = self.client.networks.list(names=[docker_network_name])
        # if len(docker_networks) > 0:
        #     network.network_id = docker_networks[0].id
        #     return

        # docker_network = self.client.networks.create(docker_network_name, driver='bridge')
        # network.network_id = docker_network.id

    @property
    def network_name(self) -> str:
        return f'{self.docker_manager.prefix}_{self.id}'

    def to_dict(self) -> dict:
        return {
            **self.config.to_dict(),
            'network': {
                'name': self.network_name,
            },
        }
