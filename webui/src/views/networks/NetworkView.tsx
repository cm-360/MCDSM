import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { NetworkInfo, ServerPeekInfo } from '../../types';
import { API_BASE_URL } from '../../constants';
import LoadingDots from '../../components/loading-dots/LoadingDots';

export interface NetworkContextType {
  networkInfo: NetworkInfo;
  servers: ServerPeekInfo[];
  shouldUpdate: number;
  requestUpdate: () => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);
export const useNetworkContext = () => useContext(NetworkContext) as NetworkContextType;

export default function NetworkView() {
  const { networkId } = useParams();
  const networkApiUrlBase = `${API_BASE_URL}/networks/${networkId}`;

  const [shouldUpdate, setShouldUpdate] = useState(0);
  const requestUpdate = useCallback(() => {
    setShouldUpdate(Date.now());
  }, []);

  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  const fetchNetworkInfo = useCallback(() => {
    fetch(networkApiUrlBase)
      .then(response => response.json())
      .then(data => setNetworkInfo(data))
      .catch(error => console.error(error));
  }, [setNetworkInfo]);

  const [servers, setServers] = useState<ServerPeekInfo[]>([]);

  const fetchServers = useCallback(() => {
    fetch(`${networkApiUrlBase}/servers`)
      .then(response => response.json())
      .then(data => setServers(data))
      .catch(error => console.error(error));
  }, [setServers]);

  useEffect(() => {
    fetchNetworkInfo();
    fetchServers();
  }, [shouldUpdate]);

  if (!networkInfo) {
    return <div className='container-md'><LoadingDots /></div>;
  }

  return (
    <NetworkContext.Provider value={{ networkInfo, servers, shouldUpdate, requestUpdate }}>
      <Outlet />
    </NetworkContext.Provider>
  );
}
