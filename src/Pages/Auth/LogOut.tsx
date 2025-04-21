import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../server/firebase";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

const LogOut = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      setIsLoading(true);
  
      try {
        await signOut(auth);
        toast.success("Success", {
          description: "You have been signed out successfully.",
        });
        navigate("/auth/login");
      } catch (error: unknown) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/network-request-failed":
              errorMessage = "Network error. Please check your internet connection.";
              break;
            default:
              errorMessage = error.message;
          }
          console.error("Logout error:", error.code, error.message);
        }
        toast.error("Error", {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="container px-4 py-80 md:px-6 max-w-6xl mx-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Sign Out</h1>
            <p className="text-gray-600 mt-2">Are you sure you want to sign out?</p>
          </div>
  
          <div className="space-y-6 mx-auto flex flex-col items-center">
            <Button
              size={"lg"}
              onClick={handleLogout}
              className=" bg-[#0C713D] hover:bg-[#095e32] cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </span>
              ) : (
                "Sign Out"
              )}
            </Button>
  
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Changed your mind?{" "}
                <a
                  href="/"
                  className="text-[#0C713D] hover:underline"
                >
                  Return to home
                </a>
              </p>
            </div>
          </div>
        </div>
        <Toaster richColors position="top-center" closeButton={false} />
      </div>
    );
  };

export default LogOut