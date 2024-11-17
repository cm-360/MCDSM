import { Link } from 'react-router-dom';
import { NetworkPeekInfo } from '../../types';

export interface NetworkListProps {
  networks: NetworkPeekInfo[];
}

export default function NetworkList({ networks }: NetworkListProps) {
  return networks.map((network) => (
    <Link key={network.id} to={`/networks/${network.id}`}>{network.display_name}</Link>
  ));
}
