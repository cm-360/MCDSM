import { Link } from 'react-router-dom';

import './ServerOverview.css';
import { useServerContext } from '../ServerView';

function ServerOverview() {
  const { serverInfo: _serverInfo } = useServerContext();

  return (
    <>
      <div>
        <Link to='console'>console</Link>
      </div>
    </>
  );
}

export default ServerOverview;
