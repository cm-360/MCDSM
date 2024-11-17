import SectionHeader from '../../../components/section-heading/SectionHeader';
import ServerList from '../../../components/server-list/ServerList';
import { useNetworkContext } from '../NetworkView';

export default function NetworkOverview() {
  const { networkInfo, servers } = useNetworkContext();

  return (
    <>
      <SectionHeader>
        <h2>{networkInfo.display_name}</h2>
      </SectionHeader>
      <div className='container-md'>
        <ServerList networkId={networkInfo.id} servers={servers} />
      </div>
    </>
  );
}
