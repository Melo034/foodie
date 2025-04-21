import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../../server/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const firstName = (form["first-name"] as HTMLInputElement).value.trim();
    const lastName = (form["last-name"] as HTMLInputElement).value.trim();
    const email = (form["email"] as HTMLInputElement).value.trim();
    const password = (form["password"] as HTMLInputElement).value;
    const confirmPassword = (form["confirm-password"] as HTMLInputElement).value;

    // Validate inputs
    if (!firstName || !lastName) {
      toast.error("Error", {
        description: "First and last names are required.",
      });
      setIsLoading(false);
      return;
    }

    if (firstName.length < 2 || lastName.length < 2) {
      toast.error("Error", {
        description: "Names must be at least 2 characters long.",
      });
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Error", {
        description: "Please enter a valid email address.",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Error", {
        description: "Passwords do not match!",
      });
      setIsLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Error", {
        description: "Password must be at least 8 characters long and include a number and a special character.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Authentication profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: `${firstName} ${lastName}`,
        email: email,
        avatar: null, // Optional: Set default or allow user to upload later
        bio: null, // Optional: Allow user to set later
        joinedAt: new Date().toISOString(), // Set current date as ISO string
        recipesCount: 0, // Initialize to 0
      });

      toast.success("Success", {
        description: "Account created successfully! Please log in.",
      });
      navigate("/auth/login");
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again later.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered. Please log in or use a different email.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please use a stronger password.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Email/password sign-up is disabled. Please contact support.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your internet connection and try again.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Please try again later.";
            break;
          default:
            errorMessage = error.message;
        }
        console.error("Sign-up error:", error.code, error.message);
      } else if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Firestore error:", error.message);
      }
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 py-32 md:px-6 max-w-6xl mx-auto">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-600 mt-2">Join our community of Sierra Leonean food enthusiasts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters long and include a number and a special character.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" required />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" required />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <Link to="/terms" className="text-[#0C713D] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-[#0C713D] hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0C713D] hover:bg-[#095e32] cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-[#0C713D] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Toaster richColors position="top-center" closeButton={false} />
    </div>
  );
};

export default SignUp;