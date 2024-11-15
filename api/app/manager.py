from __future__ import annotations

import os
import json

from .models import Collection
from .models import NetworkManager

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .models import ServerManager


class DockerManager:

    def __init__(self, docker_client) -> None:
        # Docker socket client
        self.client = docker_client
        self.prefix = 'mcdsm'

        # Volume directories
        self.networks_directory = os.getenv('NETWORKS_DIR', os.path.join(os.getcwd(), 'networks'))
        self.data_directory_internal = '/data'
        self.resources_directory_external = os.getenv('RESOURCES_DIR', os.path.join(os.getcwd(), 'shared'))
        self.resources_directory_internal = '/resources'

        self.load_resources()
        self.load_networks()

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

    def load_resources(self) -> None:
        self.collections = {}

        for entry in os.listdir(self.resources_directory_external):
            entry_path = os.path.join(self.resources_directory_external, entry)

            # Skip non-directories
            if not os.path.isdir(entry_path):
                continue

            collection = self.load_resource_collection(entry_path)
            self.collections[collection.id] = collection

    def load_resource_collection(self, collection_directory) -> Collection:
        # Read collection.json config file
        config_file_path = os.path.join(collection_directory, 'collection.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            resources = []

            # Instantiate Collection object from config
            collection = Collection(
                id=os.path.basename(collection_directory),
                display_name=config['display_name'],
                path=config['path'],
                extension=config['extension'],
                resources=resources,
            )

            return collection

    def get_network_manager(self, network_id: str) -> NetworkManager:
        return self.networks.get(network_id, None)

    def get_server_manager(self, network_id: str, server_id: str) -> ServerManager:
        network = self.get_network_manager(network_id)
        if network is None:
            return None

        server = network.servers.get(server_id, None)
        return server
