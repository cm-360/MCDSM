import { Link } from 'react-router-dom';

import './ServerOverview.css';
import { useServerContext } from '../ServerView';

export default function ServerOverview() {
  const { serverInfo: _serverInfo } = useServerContext();

  // TODO consider https://www.chartjs.org/

  return (
    <>
      <div className='container-md'>
        <Link to='console'>console</Link>
      </div>
    </>
  );
}
