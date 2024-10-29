import os
import json

from docker.errors import NotFound

from .models.networks import Network
from .models.networks import Server
from .models.networks import ConsoleBroker


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

        self.networks = {}

    def load_networks(self):
        for entry in os.listdir(self.networks_directory):
            # Full path to entry
            entry_path = os.path.join(self.networks_directory, entry)

            # Skip non-directories
            if not os.path.isdir(entry_path):
                continue

            # Load Network instance
            network = self.load_network(entry_path)
            self.networks[network.id] = network

    def load_network(self, network_directory) -> Network:
        # Read network.json config file
        config_file_path = os.path.join(network_directory, 'network.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            # Instantiate Network object from config
            network = Network(
                id=os.path.basename(network_directory),
                display_name=config['display_name'],
                directory=network_directory,
            )

            self.ensure_docker_network(network)

            self.load_servers(network)

            return network

    def load_servers(self, network):
        servers_directory = os.path.join(network.directory, 'servers')

        for entry in os.listdir(servers_directory):
            # Full path to entry
            entry_path = os.path.join(servers_directory, entry)

            # Skip non-directories
            if not os.path.isdir(entry_path):
                continue

            # Load Server instance
            server = self.load_server(network, entry_path)
            network.servers[server.id] = server

    def load_server(self, network, server_directory) -> Server:
        # Read server.json config file
        config_file_path = os.path.join(server_directory, 'server.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            # Instantiate Server object from config
            server = Server(
                id=os.path.basename(server_directory),
                display_name=config['display_name'],
                template=config['template'],
                jvm_image=config['jvm_image'],
                jvm_arguments=config['jvm_arguments'],
                jar_executable=config['jar_executable'],
                jar_arguments=config['jar_arguments'],
                resources=config['resources'],
                directory=server_directory,
                _network=network,
            )

            self.ensure_server_container(server, create=False)

            return server

    def attach_socket(self, server):
        # https://stackoverflow.com/questions/66328780/how-to-attach-a-pseudo-tty-to-a-docker-container-with-docker-py-to-replicate-beh

        # Create communication socket
        socket = server._container.attach_socket(params={'stdin': True, 'stdout': True, 'stderr': True, 'stream': True})

        server._console.set_socket(socket)
        server._console.start_socket_listener()

    def start_server(self, server):
        self.ensure_server_container(server)

        server._container.reload()
        if 'running' == server._container.status:
            return

        server._container.start()
        self.attach_socket(server)

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

    def create_server_container(self, server):
        # Path to JAR executable inside container
        jar_executable_path = os.path.join('/resources/software', server.jar_executable)

        # Volume directories
        data_directory_external = os.path.join(self.networks_directory, server._network.id, 'servers', server.id, 'data')

        # Start server container
        server._container = self.client.containers.create(
            server.jvm_image,
            command=['java', *server.jvm_arguments, '-jar', jar_executable_path, *server.jar_arguments],
            name=f'{self.prefix}_{server._network.id}_{server.id}',
            volumes=[
                f'{data_directory_external}:{self.data_directory_internal}:rw',
                f'{self.resources_directory_external}:{self.resources_directory_internal}:ro'
            ],
            working_dir=self.data_directory_internal,
            network=f'{self.prefix}_{server._network.id}',
            user=1000,
            stdin_open=True,
            tty=True,
            detach=True,
        )

    def stop_server(self, server):
        if server._container is not None:
            server._container.stop()

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
