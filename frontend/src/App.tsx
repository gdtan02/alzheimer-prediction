import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { useAuth, AuthProvider } from "./stores/authStore";

const AppRoutes = () => {

  // Get auth context store
  const { currentUser } = useAuth();

  // Set router
  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route path='/' element={(currentUser) ? <Navigate to="/dashboard" /> : <LoginPage />} />,
      <Route path='/login' element={<LoginPage />} />,
      <Route path='/register' element={<SignUpPage />} />,
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>}
      />
    ])
  );

  return <RouterProvider router={router}></RouterProvider>
};

function App() { 

  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster />
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  )
};

export default App;