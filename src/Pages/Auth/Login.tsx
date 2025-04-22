import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../../server/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Toaster, toast, } from "sonner";

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const email = (form["email"] as HTMLInputElement).value.trim();
        const password = (form["password"] as HTMLInputElement).value;

        // Validate inputs
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Error", {
                description: "Please enter a valid email address.",
            });
            setIsLoading(false);
            return;
        }

        if (!password) {
            toast.error("Error", {
                description: "Password is required.",
            });
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName || "Anonymous User",
                    email: user.email || email,
                    avatar: user.photoURL || undefined,
                    bio: undefined,
                    joinedAt: new Date().toISOString(),
                    recipesCount: 0,
                  });
            }

            toast.success("Success", {
                description: "Signed in successfully!",
            });
            navigate("/");
        } catch (error: unknown) {
            let errorMessage = "An unexpected error occurred. Please try again later.";
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case "auth/user-not-found":
                        errorMessage = "No account found with this email. Please sign up.";
                        break;
                    case "auth/wrong-password":
                        errorMessage = "Incorrect password. Please try again.";
                        break;
                    case "auth/invalid-email":
                        errorMessage = "Invalid email address format.";
                        break;
                    case "auth/invalid-credential":
                        errorMessage = "Invalid email or password.";
                        break;
                    case "auth/too-many-requests":
                        errorMessage = "Too many attempts. Please try again later.";
                        break;
                    case "auth/user-disabled":
                        errorMessage = "This account has been disabled. Contact support.";
                        break;
                    case "auth/network-request-failed":
                        errorMessage = "Network error. Please check your internet connection.";
                        break;
                    default:
                        errorMessage = error.message;
                }
                console.error("Login error:", error.code, error.message);
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
        <div className="container px-4 py-48 md:px-6 max-w-6xl mx-auto">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Welcome</h1>
                    <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your.email@example.com" required />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link to="/auth/forgot-password" className="text-sm text-[#0C713D] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input id="password" type="password" required />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#0C713D] hover:bg-[#095e32]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/auth/signup" className="text-[#0C713D] hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
            <Toaster richColors position="top-center" closeButton={false} />
        </div>
    );
};

export default Login;