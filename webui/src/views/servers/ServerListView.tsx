import { useCallback, useEffect, useState } from 'react';

import { ServerPeekInfo } from '../../types';
import { API_BASE_URL } from '../../constants';
import LoadingDots from '../../components/loading-dots/LoadingDots';
import { useNetworkContext } from '../networks/NetworkView';
import ServerList from '../../components/server-list/ServerList';
import SectionHeader from '../../components/section-heading/SectionHeader';

function ServerListView() {
  const { networkInfo } = useNetworkContext();

  const [servers, setServers] = useState<ServerPeekInfo[]>([]);

  const fetchServers = useCallback(() => {
    fetch(`${API_BASE_URL}/networks/${networkInfo.id}/servers`)
      .then(response => response.json())
      .then(data => setServers(data))
      .catch(error => console.error(error));
  }, [setServers]);

  useEffect(() => {
    fetchServers();
  }, []);

  return (
    <>
      <SectionHeader>
        <h2>Servers</h2>
      </SectionHeader>
      <div className='container-md'>
        {
          servers.length
            ? <ServerList networkId={networkInfo.id} servers={servers} />
            : <div className='container-md'><LoadingDots /></div>
        }
      </div>
    </>
  );
}

export default ServerListView;
