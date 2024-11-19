import json
import os
from functools import wraps

from docker.errors import NotFound

from ..base import Serializable
from ..resource.collection import Collection
from ..resource.resource import Resource
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
        self.load_resources()

    def load_config(self) -> None:
        # Read server.json config file
        config_file_path = os.path.join(self.directory, 'server.json')
        with open(config_file_path, 'r') as config_file:
            config = json.load(config_file)

            # Instantiate ServerConfig object from config
            self.config = ServerConfig(
                id=self.id,
                display_name=config.get('display_name', self.id),
                template=config.get('template', False),
                jvm_image=config['jvm_image'],
                jvm_arguments=config.get('jvm_arguments', []),
                jar_executable=config['jar_executable'],
                jar_arguments=config.get('jar_arguments', []),
                resources=config.get('resources', {}),
                ip_address=config['ip_address'],
                ports=config.get('ports', {}),
            )

    def load_resources(self) -> None:
        self.collections = {}

        for collection_id, collection_data in self.config.resources.items():
            shared_collection = self.network.docker_manager.collections[collection_id]

            # Use values from config or global defaults
            display_name = collection_data.get('display_name', shared_collection.display_name)
            path = collection_data.get('path', shared_collection.path)
            extension = collection_data.get('extension', shared_collection.extension)

            included_resources = collection_data.get('include', [])

            # Create Resource instances for included resources
            resources = [
                Resource(
                    name=resource_data['name'],
                    version=resource_data['version'],
                )
                for resource_data in included_resources
            ]

            # Create Collection instance
            collection = Collection(
                id=collection_id,
                display_name=display_name,
                path=path,
                extension=extension,
                resources=resources,
            )
            self.collections[collection_id] = collection

    def create_resource_links(self, source: str, destination: str):
        for collection in self.collections.values():
            # Collection location (outside server container)
            collection_destination = os.path.join(destination, collection.path)

            for resource in collection.resources:
                resource_filename = f'{resource.name}_{resource.version}{collection.extension}'

                # Link source location (inside server container)
                link_source = os.path.join(source, collection.id, resource_filename)
                # Link destination location (outside server container)
                link_destination = os.path.join(collection_destination, resource_filename)
                try:
                    os.symlink(link_source, link_destination)
                except FileExistsError:
                    # TODO check and replace link if incorrect
                    pass

    def get_or_create_container(self):
        if self.container is None:
            self.create_container()

        # TODO re-create container if removed while api running

        return self.container

    def create_container(self) -> None:
        # Path to JAR executable inside container
        jar_executable_path = os.path.join(self.resources_directory_internal, 'software', self.config.jar_executable)

        # TODO pull image if needed

        # Networking config
        self.network.get_or_create_network()
        endpoint_config = self.network.docker_manager.client.api.create_endpoint_config(
            ipv4_address=self.config.ip_address,
        )
        networking_config = self.network.docker_manager.client.api.create_networking_config({
            self.network.network_name: endpoint_config,
        })

        # Create server container
        self._container = self.network.docker_manager.client.containers.create(
            self.config.jvm_image,
            command=['java', *self.config.jvm_arguments, '-jar', jar_executable_path, *self.config.jar_arguments],
            name=self.container_name,
            volumes=[
                f'{self.data_directory_external}:{self.data_directory_internal}:rw',
                f'{self.resources_directory_external}:{self.resources_directory_internal}:ro'
            ],
            working_dir=self.data_directory_internal,
            network=self.network.network_name,
            networking_config=networking_config,
            ports=self.config.ports,
            user=1000,
            stdin_open=True,
            tty=True,
            detach=True,
        )

    def start_container(self) -> None:
        self.create_resource_links(self.resources_directory_internal, self.data_directory_external)
        self.get_or_create_container().start()

    def stop_container(self) -> None:
        if self.container is None:
            return  # TODO error

        self.container.stop()

    def connect_socket(self) -> None:
        self.close_socket()

        self._socket = self.container.attach_socket(params={
            'stdin': True,
            'stdout': True,
            'stderr': True,
            'stream': True,
        })

    def close_socket(self) -> None:
        if self._socket is not None:
            self._socket.close()

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
            self.connect_socket()

        return self._socket

    @property
    def data_directory_external(self) -> str:
        return os.path.join(self.network.docker_manager.networks_directory_external, self.network.id, 'servers', self.id, 'data')

    @property
    def data_directory_internal(self) -> str:
        return self.network.docker_manager.data_directory_internal

    @property
    def resources_directory_external(self) -> str:
        return self.network.docker_manager.resources_directory_external

    @property
    def resources_directory_internal(self) -> str:
        return self.network.docker_manager.resources_directory_internal

    def to_dict(self) -> dict:
        return {
            **self.config.to_dict(),
            'container': {
                'name': self.container_name,
                'status': self.container_status,
            },
            'resources': self.collections,
        }
