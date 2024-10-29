import { Link, useLocation } from 'react-router-dom';
import './AppSidebar.css';
import { AppView } from '../App';

export interface AppSidebarProps {
  appViews: AppView[];
}

function AppSidebar({ appViews }: AppSidebarProps) {
  const location = useLocation();

  const viewButtons = appViews.map((view) => {
    const isActive = location.pathname == view.path;
    const buttonActiveClass = isActive ? ' active': '';
    const iconActiveSuffix = isActive ? '-fill' : '';

    return (
      <Link key={view.name} className={'app-sidebar-button' + buttonActiveClass} title={view.name} to={view.path}>
          <i className={`bi bi-${view.icon}` + iconActiveSuffix}></i>
      </Link>
    );
  });

  return (
    <aside className='app-sidebar'>
      {viewButtons}
    </aside>
  );
}

export default AppSidebar;
