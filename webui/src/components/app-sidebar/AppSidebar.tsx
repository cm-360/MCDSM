import { Link, useLocation } from 'react-router-dom';
import './AppSidebar.css';

const appViews = [
  {
    name: 'Dashboard',
    icon: 'house',
    path: '/',
  },
  {
    name: 'Servers',
    icon: 'hdd-stack',
    path: '/servers',
  },
  {
    name: 'Resources',
    icon: 'box-seam',
    path: '/resources',
  },
  {
    name: 'Settings',
    icon: 'gear',
    path: '/settings',
  },
];

function AppSidebar() {
  const location = useLocation();

  const sidebarButtons = appViews.map((view) => {
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
      {sidebarButtons}
    </aside>
  );
}

export default AppSidebar;
