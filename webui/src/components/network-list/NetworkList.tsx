import { Link } from 'react-router-dom';
import { NetworkPeekInfo } from '../../types';
import ListGroup from '../list-group/ListGroup';

export interface NetworkListProps {
  networks: NetworkPeekInfo[];
}

export default function NetworkList({ networks }: NetworkListProps) {
  const listItems =  networks.map((network) => (
    <Link key={network.id} to={`/networks/${network.id}`}>{network.display_name}</Link>
  ));

  return (
    <ListGroup>
      {listItems}
    </ListGroup>
  );
}
