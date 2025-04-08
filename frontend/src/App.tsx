import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';

const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path='/' element={<LoginPage />} />,
    <Route path='/login' element={<LoginPage />} />,
    <Route path='/register' element={<SignUpPage />} />,
    <Route path='/dashboard' element={<DashboardPage />} />
  ])
);

function App() { 
  return (
    <RouterProvider router={router}></RouterProvider>
  )
};

export default App;