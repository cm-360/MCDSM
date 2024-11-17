import { Link } from 'react-router-dom';
import { ServerPeekInfo } from '../../types';
import ListGroup from '../list-group/ListGroup';

export interface ServerListProps {
  networkId: string;
  servers: ServerPeekInfo[];
}

export default function ServerList({ networkId, servers }: ServerListProps) {
  const listItems = servers.map((server) => (
    <Link key={server.id} to={`/networks/${networkId}/servers/${server.id}`}>{server.display_name}</Link>
  ));

  return (
    <ListGroup>
      {listItems}
    </ListGroup>
  );
}
