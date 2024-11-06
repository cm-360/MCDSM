import json
import os
from functools import wraps

from docker.errors import NotFound

from ..base import Serializable
from .server_config import ServerConfig
from .console_broker import ConsoleBroker


class ServerManager(Serializable):

    def __init__(self, network: 'NetworkManager', directory: str):
        self.network = network
        self.directory = directory
        self.id = os.path.basename(self.directory)
        # Docker
        self._container = None
        self.socket = None
        self.console = ConsoleBroker()
        # Load JSON config
        self.load_config()

    def load_config(self):
        # Read server.json config file
        config_file_path = os.path.join(self.directory, 'server.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            # Instantiate Server object from config
            self.config = ServerConfig(
                id=self.id,
                display_name=config['display_name'],
                template=config['template'],
                jvm_image=config['jvm_image'],
                jvm_arguments=config['jvm_arguments'],
                jar_executable=config['jar_executable'],
                jar_arguments=config['jar_arguments'],
                resources=config['resources'],
            )

            # self.ensure_server_container(server, create=False)

    def create_container(self):
        # Volume directories
        data_directory_external = os.path.join(self.network.directory, 'servers', self.id, 'data')
        data_directory_internal = self.network.docker_manager.data_directory_internal
        resources_directory_external = self.network.docker_manager.resources_directory_external
        resources_directory_internal = self.network.docker_manager.resources_directory_internal

        # Path to JAR executable inside container
        jar_executable_path = os.path.join(resources_directory_internal, 'software', self.config.jar_executable)

        # Create server container
        self._container = self.network.docker_manager.client.containers.create(
            self.config.jvm_image,
            command=['java', *self.config.jvm_arguments, '-jar', jar_executable_path, *self.config.jar_arguments],
            name=self.container_name,
            volumes=[
                f'{data_directory_external}:{data_directory_internal}:rw',
                f'{resources_directory_external}:{resources_directory_internal}:ro'
            ],
            working_dir=data_directory_internal,
            network=self.network.network_name,
            user=1000,
            stdin_open=True,
            tty=True,
            detach=True,
        )

    def start_container(self):
        self.container.start()
        # self.attach_socket()

    def stop_container(self):
        self.container.stop()

    def attach_socket(self):
        # https://stackoverflow.com/questions/66328780/how-to-attach-a-pseudo-tty-to-a-docker-container-with-docker-py-to-replicate-beh

        # Create communication socket
        self.socket = self.container.attach_socket(params={'stdin': True, 'stdout': True, 'stderr': True, 'stream': True})

        self.console.set_socket(socket)
        self.console.start_socket_listener()

    @property
    def container(self):
        # Find or create container
        if self._container is None:
            try:
                self._container = self.network.docker_manager.client.containers.get(self.container_name)
            except NotFound:
                self.create_container()

        return self._container

    @property
    def container_name(self):
        return f'{self.network.network_name}_{self.id}'

    @property
    def container_status(self):
        if self._container is None:
            return 'removed'
        else:
            self._container.reload()
            # 'restarting', 'running', 'paused', or 'exited'
            return self._container.status

    def to_dict(self):
        return {
            **self.config.to_dict(),
            'container': {
                'name': self.container_name,
                'status': self.container_status,
            },
        }
