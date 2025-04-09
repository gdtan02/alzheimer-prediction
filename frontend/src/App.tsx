import { useEffect } from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from "./components/ProtectedRoute";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { useAuth } from "./stores/authStore";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";

function App() { 

  // Get auth context store
  const { currentUser, setUser, setLoading } = useAuth();

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    })
    return () => unsubscribe();
  }, [setUser, setLoading])

  // Set router
  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route path='/' element={ (currentUser) ? <Navigate to="/dashboard" /> : <LoginPage /> } />,
      <Route path='/login' element={<LoginPage />} />,
      <Route path='/register' element={<SignUpPage />} />,
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>}
      />
    ])
  );

  return (
    <ThemeProvider>
      <Toaster />
        {<RouterProvider router={router}></RouterProvider>}
    </ThemeProvider>
  )
};

export default App;