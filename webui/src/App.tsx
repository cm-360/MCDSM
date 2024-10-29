import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './theme.css';
import AppSidebar from './components/AppSidebar';
import DashboardView from './views/dashboard/DashboardView';

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
    element: <DashboardView />,
  },
  {
    name: 'Resources',
    icon: 'box-seam',
    path: '/resources',
    element: <DashboardView />,
  },
  {
    name: 'Settings',
    icon: 'gear',
    path: '/settings',
    element: <DashboardView />,
  },
];

function App() {
  return (
    <BrowserRouter>
      <AppSidebar appViews={appViews} />
      <main>
        <Routes>
          <Route path='/' element={<DashboardView />}></Route>
          <Route path='/servers'></Route>
          <Route path='/resources'></Route>
          <Route path='/settings'></Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
