import { useCallback, useEffect, useState } from 'react';
import { NetworkPeekInfo } from '../../types';
import { API_BASE_URL } from '../../constants';
import SectionHeader from '../../components/section-heading/SectionHeader';
import NetworkList from '../../components/network-list/NetworkList';
import LoadingDots from '../../components/loading-dots/LoadingDots';

export default function NetworkListView() {
  const [networks, setNetworks] = useState<NetworkPeekInfo[]>([]);

  const fetchNetworks = useCallback(() => {
    fetch(`${API_BASE_URL}/networks`)
      .then(response => response.json())
      .then(data => setNetworks(data))
      .catch(error => console.error(error));
  }, [setNetworks]);

  useEffect(() => {
    fetchNetworks();
  }, []);

  return (
    <>
      <SectionHeader>
        <h2>Networks</h2>
      </SectionHeader>
      <div className='container-md'>
        {
          networks.length
            ? <NetworkList networks={networks} />
            : <LoadingDots />
        }
      </div>
    </>
  );
}
