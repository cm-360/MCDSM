import { Link } from 'react-router-dom';
import { ServerPeekInfo } from '../../types';

export interface ServerListProps {
  networkId: string;
  servers: ServerPeekInfo[];
}

export default function ServerList({ networkId, servers }: ServerListProps) {
  return servers.map((server) => (
    <Link key={server.id} to={`/networks/${networkId}/servers/${server.id}`}>{server.display_name}</Link>
  ));
}
