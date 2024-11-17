import { Link } from 'react-router-dom';
import { useNetworkContext } from '../../views/networks/network/NetworkView';

export default function ServerList() {
  const { networkInfo, servers } = useNetworkContext();

  return servers.map((server) => (
    <Link key={server.id} to={`/networks/${networkInfo.id}/servers/${server.id}`}>{server.display_name}</Link>
  ));
}
