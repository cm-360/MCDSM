import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css';

import { Outlet } from "react-router-dom";
import AppSidebar from "./components/app-sidebar/AppSidebar";
import Breadcrumbs from './components/breadcrumbs/Breadcrumbs';

function App() {
  return (
    <>
      <AppSidebar />
      <div className='app-content'>
        <header>
          <Breadcrumbs />
        </header>
        <main className='main-content'>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
