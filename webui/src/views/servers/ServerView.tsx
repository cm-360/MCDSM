import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../constants';
import { ServerInfo } from '../../types';

import './ServerView.css';
import { useNetworkContext } from '../networks/NetworkView';
import SectionHeader from '../../components/section-heading/SectionHeader';
import LoadingDots from '../../components/loading-dots/LoadingDots';

export interface ServerContextType {
  serverInfo: ServerInfo;
  shouldUpdate: number;
  requestUpdate: () => void;
}

const ServerContext = createContext<ServerContextType | null>(null);
export const useServerContext = () => useContext(ServerContext) as ServerContextType;

export default function ServerView() {
  const { networkInfo } = useNetworkContext();
  const { serverId } = useParams();

  const serverApiUrlBase = `${API_BASE_URL}/networks/${networkInfo.id}/servers/${serverId}`;

  const [shouldUpdate, setShouldUpdate] = useState(0);
  const requestUpdate = useCallback(() => {
    setShouldUpdate(Date.now());
  }, []);

  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  const fetchServerInfo = useCallback(() => {
    fetch(serverApiUrlBase)
      .then(response => response.json())
      .then(data => setServerInfo(data))
      .catch(error => console.error(error));
  }, [setServerInfo]);

  useEffect(() => {
    fetchServerInfo();
  }, [shouldUpdate]);

  const startServer = useCallback(() => {
    fetch(`${serverApiUrlBase}/start`)
      .then(() => requestUpdate())
      .catch(error => console.error(error));
  }, []);

  const stopServer = useCallback(() => {
    fetch(`${serverApiUrlBase}/stop`)
      .then(() => requestUpdate())
      .catch(error => console.error(error));
  }, []);

  if (!serverInfo) {
    return <div className='container-md'><LoadingDots /></div>;
  }

  const isRunning = 'running' === serverInfo.container.status;

  const runningStatus = <span className='server-status running'><i className='bi bi-check-circle' /> Running</span>;
  const stoppedStatus = <span className='server-status stopped'><i className='bi bi-x-circle' /> Stopped</span>;

  const startButton = <button className='button button-success' onClick={startServer}><i className='bi bi-play' /> Start</button>;
  const stopButton = <button className='button button-danger' onClick={stopServer}><i className='bi bi-stop' /> Stop</button>;

  return (
    <ServerContext.Provider value={{ serverInfo, shouldUpdate, requestUpdate }}>
      <SectionHeader>
        <div className='server-view-header'>
          <span className='server-details'>
            <h2 className='server-title'>{serverInfo.display_name}</h2>
            {isRunning ? runningStatus : stoppedStatus}
            <span className='server-players'><i className='bi bi-person' /> 0 Players</span>
          </span>
          <span className='server-actions'>
            {isRunning ? stopButton : startButton}
            <button className='button'><i className='bi bi-arrow-clockwise' /> Restart</button>
            <button className='button button-danger' onClick={stopServer}><i className='bi bi-x-lg' /> Terminate</button>
          </span>
        </div>
      </SectionHeader>
      <Outlet />
    </ServerContext.Provider>
  );
}
