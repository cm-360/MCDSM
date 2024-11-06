from __future__ import annotations

import os
import json

from .models import NetworkManager

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .models import ServerManager


class DockerManager:

    def __init__(self, docker_client) -> None:
        # Docker socket client
        self.client = docker_client
        self.prefix = 'mcdsm'

        # TODO: use env config instead of cwd
        cwd = os.getcwd()

        # Volume directories
        self.networks_directory = os.path.join(cwd, 'networks')
        self.data_directory_internal = '/data'
        self.resources_directory_external = os.path.join(cwd, 'shared')
        self.resources_directory_internal = '/resources'
        
    def load_networks(self) -> None:
        self.networks = {}

        for entry in os.listdir(self.networks_directory):
            # Full path to entry
            entry_path = os.path.join(self.networks_directory, entry)

            # Skip non-directories
            if not os.path.isdir(entry_path):
                continue

            # Load Network instance
            network = NetworkManager(self, entry_path)
            self.networks[network.id] = network

    def get_network_manager(self, network_id: str) -> NetworkManager:
        return self.networks.get(network_id, None)

    def get_server_manager(self, network_id: str, server_id: str) -> ServerManager:
        network = self.get_network_manager(network_id)
        if network is None:
            return None

        server = network.servers.get(server_id, None)
        return server
