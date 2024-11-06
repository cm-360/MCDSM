import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../../constants';
import { ServerInfo } from '../../../types';

import './ServerView.css';

export interface ServerContextType {
  serverInfo: ServerInfo;
  shouldUpdate: number;
  requestUpdate: () => void;
}

const ServerContext = createContext<ServerContextType | null>(null);
export const useServerContext = () => useContext(ServerContext) as ServerContextType;

const networkId = 'example';

function ServerView() {
  const { serverId } = useParams();
  const serverApiUrlBase = `${API_BASE_URL}/networks/${networkId}/servers/${serverId}`;

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
    // TODO loading
    return <></>;
  }

  const isRunning = 'running' === serverInfo.container.status;

  const runningStatus = <span className='server-status' style={{ color: 'var(--color-positive-alt)' }}><i className='bi bi-check-circle' /> Running</span>;
  const stoppedStatus = <span className='server-status' style={{ color: 'var(--color-negative-alt)' }}><i className='bi bi-x-circle' /> Stopped</span>;

  const startButton = <button className='button button-success' onClick={startServer}><i className='bi bi-play' /> Start</button>;
  const stopButton = <button className='button button-danger' onClick={stopServer}><i className='bi bi-stop' /> Stop</button>;

  return (
    <ServerContext.Provider value={{ serverInfo, shouldUpdate, requestUpdate }}>
      <header className='server-view-header container-md'>
        <div className='server-details'>
          <h2 className='server-title'>{serverInfo.display_name}</h2>
          {isRunning ? runningStatus : stoppedStatus}
          <span className='server-players'><i className='bi bi-person' /> 0 Players</span>
        </div>
        <div className='server-actions'>
          {isRunning ? stopButton : startButton}
          <button className='button'><i className='bi bi-arrow-clockwise' /> Restart</button>
          <button className='button button-danger' onClick={stopServer}><i className='bi bi-x-lg' /> Terminate</button>
        </div>
      </header>
      <Outlet />
    </ServerContext.Provider>
  );
}

export default ServerView;
