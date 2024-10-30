import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import App from './App';

import DashboardView from './views/dashboard/DashboardView';
import ServersView from './views/servers/ServersView';
import ServerView from './views/servers/server/ServerView';
import ResourcesView from './views/resources/ResourcesView';
import SettingsView from './views/settings/SettingsView';

function AppRouter() {
  const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<App />}>
          <Route path='' element={<DashboardView />} />
          <Route path='servers'>
            <Route path='' element={<ServersView />} />
            <Route path=':serverId' element={<ServerView />} />
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

export default AppRouter;
