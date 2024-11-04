import json
import os

from ..base import Serializable
from ..server.server_manager import ServerManager
from .network_config import NetworkConfig


class NetworkManager(Serializable):

    def __init__(self, docker_manager, directory: str):
        self.docker_manager = docker_manager
        self.directory = directory
        self.id = os.path.basename(self.directory)
        self.load_config()
        self.load_servers()

    def load_config(self):
        # Read network.json config file
        config_file_path = os.path.join(self.directory, 'network.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            # Instantiate Network object from config
            self.config = NetworkConfig(
                id=self.id,
                display_name=config['display_name'],
            )

            # self.ensure_docker_network(network)

    def load_servers(self):
        self.servers = {}

        servers_directory = os.path.join(self.directory, 'servers')

        for entry in os.listdir(servers_directory):
            # Full path to entry
            entry_path = os.path.join(servers_directory, entry)

            # Skip non-directories
            if not os.path.isdir(entry_path):
                continue

            # Load Server instance
            server = ServerManager(self, entry_path)
            self.servers[server.id] = server

    @property
    def network_name(self):
        return f'{self.docker_manager.prefix}_{self.id}'

    def to_dict(self):
        return {
            **self.config.to_dict(),
            'network': {
                'name': self.network_name,
            },
        }
