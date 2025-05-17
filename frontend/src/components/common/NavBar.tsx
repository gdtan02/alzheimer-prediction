/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "../ui/button";
import { useAuth } from "@/stores/authStore";
import { AuthService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NavBar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await AuthService.signOutUser();

            toast.success("Logout successfully!");

            navigate("/login");
        } catch (error: any) {
            toast.error("Logout failed", {
                description: error.message || "An error occurred during logout."
            })
        } 
    }

    return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <img src="/src/assets/mental-health-dark.png" alt="Alzheimer's Prediction System Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold">Alzheimer's Prediction System</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;