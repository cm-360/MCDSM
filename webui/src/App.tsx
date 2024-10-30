import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css';
import './theme.css';

import { Outlet } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";
import Breadcrumbs from './components/breadcrumbs/Breadcrumbs';

function App() {
  return (
    <>
      <AppSidebar />
      <main className='main-content'>
        <Breadcrumbs />
        <Outlet/>
      </main>
    </>
  );
}

export default App;
