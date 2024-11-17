import { Link, useLocation } from 'react-router-dom';
import './AppSidebar.css';

const appViews = [
  {
    name: 'Dashboard',
    icon: 'house',
    path: '/dashboard',
  },
  {
    name: 'Networks',
    icon: 'hdd-stack',
    path: '/networks',
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
    const isActive = location.pathname.startsWith(view.path);
    const buttonActiveClass = isActive ? ' active': '';

    return (
      <Link key={view.name} className={'app-sidebar-button' + buttonActiveClass} title={view.name} to={view.path}>
          <i className={`bi bi-${view.icon}`}></i>
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
