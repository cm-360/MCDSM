import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './theme.css';
import AppSidebar from './components/AppSidebar';
import DashboardView from './views/dashboard/DashboardView';
import ServersView from './views/servers/ServersView';
import ResourcesView from './views/resources/ResourcesView';
import SettingsView from './views/settings/SettingsView';

export interface AppView {
  name: string;
  icon: string;
  path: string;
  element: JSX.Element;
};

const appViews: AppView[] = [
  {
    name: 'Dashboard',
    icon: 'house',
    path: '/',
    element: <DashboardView />,
  },
  {
    name: 'Servers',
    icon: 'hdd-stack',
    path: '/servers',
    element: <ServersView />,
  },
  {
    name: 'Resources',
    icon: 'box-seam',
    path: '/resources',
    element: <ResourcesView />,
  },
  {
    name: 'Settings',
    icon: 'gear',
    path: '/settings',
    element: <SettingsView />,
  },
];

function App() {
  const viewRoutes = appViews.map((view) => 
    <Route key={view.name} path={view.path} element={view.element}></Route>
  );

  return (
    <BrowserRouter>
      <AppSidebar appViews={appViews} />
      <main>
        <Routes>
          {viewRoutes}
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
