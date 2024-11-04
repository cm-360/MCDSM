import os
import json

from docker.errors import NotFound

from .models import NetworkManager
from .models import ServerManager
from .models import ConsoleBroker


class Manager:

    def __init__(self, docker_client):
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
        
    def load_networks(self):
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

    def get_network(self, network_id: str):
        return self.networks.get(network_id, None)

    def get_server(self, network_id: str, server_id: str):
        network = self.get_network(network_id)
        if network is None:
            return None

        server = network.servers.get(server_id, None)
        return server

    def ensure_server_container(self, server, create=True):
        # Nothing to do if container exists
        if server._container is not None:
            return

        # Find existing container by name
        try:
            container_name = f'{self.prefix}_{server._network.id}_{server.id}'
            server._container = self.client.containers.get(container_name)

            server._container.reload()
            if 'running' == server._container.status:
                self.attach_socket(server)
        except NotFound:
            pass

        if create:
            self.create_server_container(server)

    def ensure_docker_network(self, network):
        if network.network_id is not None:
            return

        docker_network_name = f'{self.prefix}_{network.id}'

        docker_networks = self.client.networks.list(names=[docker_network_name])
        if len(docker_networks) > 0:
            network.network_id = docker_networks[0].id
            return

        docker_network = self.client.networks.create(docker_network_name, driver='bridge')
        network.network_id = docker_network.id
