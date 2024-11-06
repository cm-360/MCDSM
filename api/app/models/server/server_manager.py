import json
import os
from functools import wraps

from docker.errors import NotFound

from ..base import Serializable
from .server_config import ServerConfig
from .console_broker import ConsoleBroker


class ServerManager(Serializable):

    def __init__(self, network: 'NetworkManager', directory: str) -> None:
        self.network = network
        self.directory = directory
        self.id = os.path.basename(self.directory)
        # Docker
        self._container = None
        self._socket = None
        self.console = ConsoleBroker(self)
        # Load JSON config
        self.load_config()

    def load_config(self) -> None:
        # Read server.json config file
        config_file_path = os.path.join(self.directory, 'server.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            # Instantiate ServerConfig object from config
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

    def get_or_create_container(self):
        if self.container is None:
            self.create_container()

        return self.container

    def create_container(self) -> None:
        # Volume directories
        data_directory_external = os.path.join(self.network.directory, 'servers', self.id, 'data')
        data_directory_internal = self.network.docker_manager.data_directory_internal
        resources_directory_external = self.network.docker_manager.resources_directory_external
        resources_directory_internal = self.network.docker_manager.resources_directory_internal

        # Path to JAR executable inside container
        jar_executable_path = os.path.join(resources_directory_internal, 'software', self.config.jar_executable)

        # TODO pull image if needed

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

    def start_container(self) -> None:
        self.get_or_create_container().start()
        # self.attach_socket()

    def stop_container(self) -> None:
        if self.container is None:
            return  # TODO error

        self.container.stop()

    @property
    def container(self):
        if self._container is None:
            try:
                self._container = self.network.docker_manager.client.containers.get(self.container_name)
            except NotFound:
                return None

        return self._container

    @property
    def container_name(self) -> str:
        return f'{self.network.network_name}_{self.id}'

    @property
    def container_status(self) -> str:
        if self.container is None:
            return 'removed'
        else:
            self.container.reload()
            # 'restarting', 'running', 'paused', or 'exited'
            return self.container.status

    # https://stackoverflow.com/questions/66328780/how-to-attach-a-pseudo-tty-to-a-docker-container-with-docker-py-to-replicate-beh
    @property
    def socket(self):
        if self._socket is None:
            self._socket = self.container.attach_socket(params={'stdin': True, 'stdout': True, 'stderr': True, 'stream': True})

        return self._socket

    def to_dict(self) -> dict:
        return {
            **self.config.to_dict(),
            'container': {
                'name': self.container_name,
                'status': self.container_status,
            },
        }
