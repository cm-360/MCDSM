import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../../constants';
import { ServerInfo } from '../../../types';

import './ServerView.css';

export interface ServerContextType {
  serverInfo: ServerInfo;
}

const ServerContext = createContext<ServerContextType | null>(null);
export const useServerContext = () => useContext(ServerContext) as ServerContextType;

const networkId = 'example';

function ServerView() {
  const { serverId } = useParams();

  const serverApiUrlBase = `${API_BASE_URL}/networks/${networkId}/servers/${serverId}`;

  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  const fetchServerInfo = useCallback(() => {
    fetch(serverApiUrlBase)
      .then(response => response.json())
      .then(data => setServerInfo(data))
      .catch(error => console.error(error));
  }, [setServerInfo]);

  useEffect(() => {
    fetchServerInfo();
  }, []);

  const startServer = useCallback(() => {
    fetch(`${serverApiUrlBase}/start`)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  }, []);

  const stopServer = useCallback(() => {
    fetch(`${serverApiUrlBase}/stop`)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  }, []);

  if (null === serverInfo) {
    return <></>;
  }

  const isRunning = 'running' === serverInfo.container.status;

  const statusText = isRunning ? 'Running' : 'Stopped';
  const statusColor = isRunning ? 'lime' : 'red';
  const statusIcon = isRunning ? 'check-circle' : 'x-circle';

  return (
    <ServerContext.Provider value={{ serverInfo }}>
      <header className='server-view-header container-md'>
        <div className='server-details'>
          <h2 className='server-title'>{serverInfo.display_name}</h2>
          <span className='server-status' style={{ color: statusColor }}><i className={`bi bi-${statusIcon}`} /> {statusText}</span>
          <span className='server-players'><i className='bi bi-person' /> 0 Players</span>
        </div>
        <div className='server-actions'>
          <button className='button' onClick={startServer}><i className='bi bi-play' /> Start / Stop</button>
          <button className='button'><i className='bi bi-arrow-clockwise' /> Restart</button>
          <button className='button' onClick={stopServer}><i className='bi bi-x-lg' /> Terminate</button>
        </div>
      </header>
      <Outlet />
    </ServerContext.Provider>
  );
}

export default ServerView;
