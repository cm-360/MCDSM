import { Link } from 'react-router-dom';

import './ServerOverview.css';

function ServerOverview() {
  const isRunning = false;

  const statusText = isRunning ? 'Running' : 'Stopped';
  const statusColor = isRunning ? 'lime' : 'red';
  const statusIcon = isRunning ? 'check-circle' : 'x-circle';

  return (
    <>
      <header className='server-overview-header container-md'>
        <div className='server-details'>
          <h2 className='server-title'>Server Name</h2>
          <span className='server-status' style={{color: statusColor}}><i className={`bi bi-${statusIcon}`} /> {statusText}</span>
          <span className='server-players'><i className='bi bi-person' /> 0 Players</span>
        </div>
        <div className='server-actions'>
          <button className='button'><i className='bi bi-play' /> Start / Stop</button>
          <button className='button'><i className='bi bi-arrow-clockwise' /> Restart</button>
          <button className='button'><i className='bi bi-x-lg' /> Terminate</button>
        </div>
      </header>
      <div>
        <Link to='console'>console</Link>
      </div>
    </>
  );
}

export default ServerOverview;
