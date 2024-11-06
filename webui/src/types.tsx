export interface ServerPeekInfo {
  id: string;
  display_name: string;
}

export interface ServerInfo {
  id: string;
  // From ServerConfig
  display_name: string;
  template: boolean;
  jvm_image: string;
  jvm_arguments: string[];
  jar_executable: string;
  jar_arguments: string[];
  resources: string;
  // From ServerManager
  container: ServerContainerInfo;
}

export interface ServerContainerInfo {
  name: string;
  status: string;
}
