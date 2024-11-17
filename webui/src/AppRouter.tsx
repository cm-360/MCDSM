import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';

import App from './App';

import DashboardView from './views/dashboard/DashboardView';
import NetworkListView from './views/networks/NetworkListView';
import ServerListView from './views/servers/ServerListView';
import ServerView from './views/servers/ServerView';
import ServerOverview from './views/servers/overview/ServerOverview';
import ServerConsole from './views/servers/console/ServerConsole';
import ResourcesView from './views/resources/ResourcesView';
import SettingsView from './views/settings/SettingsView';
import NetworkView from './views/networks/NetworkView';
import NetworkOverview from './views/networks/overview/NetworkOverview';

export default function AppRouter() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<App />}>
        <Route path='' element={<Navigate to='/dashboard' />} />
        <Route path='dashboard' element={<DashboardView />} />
        <Route path='networks'>
          <Route path='' element={<NetworkListView />} />
          <Route path=':networkId' element={<NetworkView />}>
            <Route path='' element={<NetworkOverview />} />
            <Route path='servers'>
              <Route path='' element={<ServerListView />} />
              <Route path=':serverId' element={<ServerView />}>
                <Route path='' element={<ServerOverview />} />
                <Route path='console' element={<ServerConsole />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path='resources' element={<ResourcesView />} />
        <Route path='settings' element={<SettingsView />} />
      </Route>
    )
  );

  return (
    <RouterProvider router={router} />
  );
}
