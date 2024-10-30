import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ServersSidebar from './sidebar/ServersSidebar';

const serversTest = [
  {
    id: 'survival',
    name: 'survival',
  },
  {
    id: 'creative',
    name: 'creative',
  },
];

function ServersView() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    ;
  }, []);

  return (
    <>
      <ServersSidebar />
      {serversTest.map((server) => 
        <Link key={server.id} to={server.id}>{server.name}</Link>
      )}
    </>
  );
}

export default ServersView;
