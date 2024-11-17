import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';

import App from './App';

import DashboardView from './views/dashboard/DashboardView';
import NetworksView from './views/networks/NetworksView';
import ServersView from './views/servers/ServersView';
import ServerView from './views/servers/server/ServerView';
import ServerOverview from './views/servers/server/overview/ServerOverview';
import ServerConsole from './views/servers/server/console/ServerConsole';
import ResourcesView from './views/resources/ResourcesView';
import SettingsView from './views/settings/SettingsView';
import NetworkView from './views/networks/network/NetworkView';

export default function AppRouter() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<App />}>
        <Route path='' element={<Navigate to='/dashboard' />} />
        <Route path='dashboard' element={<DashboardView />} />
        <Route path='networks'>
          <Route path='' element={<NetworksView />} />
          <Route path=':networkId'>
            <Route path='' element={<NetworkView />} />
            <Route path='servers'>
              <Route path='' element={<ServersView />} />
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
