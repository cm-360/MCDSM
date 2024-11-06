import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ServersSidebar from './sidebar/ServersSidebar';
import { ServerPeekInfo } from '../../types';
import { API_BASE_URL } from '../../constants';

const networkId = 'example';

function ServersView() {
  const [servers, setServers] = useState<ServerPeekInfo[]>([]);

  const fetchServers = useCallback(() => {
    fetch(`${API_BASE_URL}/networks/${networkId}/servers`)
      .then(response => response.json())
      .then(data => setServers(data))
      .catch(error => console.error(error));
  }, [setServers]);

  useEffect(() => {
    fetchServers();
  }, []);

  return (
    <>
      <ServersSidebar />
      {servers.map((server) => 
        <Link key={server.id} to={server.id}>{server.display_name}</Link>
      )}
    </>
  );
}

export default ServersView;
