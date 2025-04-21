import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../server/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (code) {
      setOobCode(code);
      // Verify the reset code
      verifyPasswordResetCode(auth, code)
        .then(() => {
          setIsCodeValid(true);
        })
        .catch((error) => {
          console.error("Verify reset code error:", error);
          setIsCodeValid(false);
          toast.error("Error", {
            description: "Invalid or expired reset link. Please request a new one.",
          });
        });
    } else {
      setIsCodeValid(false);
      toast.error("Error", {
        description: "No reset code provided. Please request a new reset link.",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    if (password !== confirmPassword) {
      toast.error("Error", {
        description: "Passwords do not match.",
      });
      setIsLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Error", {
        description:
          "Password must be at least 8 characters long and include a number and a special character.",
      });
      setIsLoading(false);
      return;
    }

    if (!oobCode || !isCodeValid) {
      toast.error("Error", {
        description: "Invalid or expired reset link. Please request a new one.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Success", {
        description: "Password reset successfully. Please sign in with your new password.",
      });
      navigate("/auth/login");
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-action-code":
            errorMessage = "Invalid or expired reset link. Please request a new one.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please use a stronger password.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your internet connection.";
            break;
          default:
            errorMessage = error.message;
        }
        console.error("Reset password error:", error.code, error.message);
      }
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCodeValid === false) {
    return (
      <div className="container px-4 py-48 md:px-6 max-w-6xl mx-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Invalid Reset Link</h1>
            <p className="text-gray-600 mt-2">
              The password reset link is invalid or has expired.
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-[#0C713D] hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-48 md:px-6 max-w-6xl mx-auto">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Set New Password</h1>
          <p className="text-gray-600 mt-2">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters long and include a number and a special
              character.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0C713D] hover:bg-[#095e32]"
            disabled={isLoading || isCodeValid === null}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/auth/login" className="text-[#0C713D] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Toaster richColors position="top-center" closeButton={true} />
    </div>
  );
};

export default ResetPassword;