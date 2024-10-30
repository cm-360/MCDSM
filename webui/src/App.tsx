import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css';

import { Outlet } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";
import Breadcrumbs from './components/breadcrumbs/Breadcrumbs';

function App() {
  return (
    <>
      <AppSidebar />
      <div className='app-content'>
        <Breadcrumbs />
        <main className='main-content'>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
