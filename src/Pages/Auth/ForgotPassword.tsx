import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../server/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Error", {
                description: "Please enter a valid email address.",
            });
            setIsLoading(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email, {
                url: `${window.location.origin}/auth/reset-password`,
            });
            toast.success("Success", {
                description: "Password reset email sent. Please check your inbox.",
            });
            navigate("/auth/login");
        } catch (error: unknown) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case "auth/user-not-found":
                        errorMessage = "No account found with this email.";
                        break;
                    case "auth/invalid-email":
                        errorMessage = "Invalid email address format.";
                        break;
                    case "auth/too-many-requests":
                        errorMessage = "Too many requests. Please try again later.";
                        break;
                    case "auth/network-request-failed":
                        errorMessage = "Network error. Please check your internet connection.";
                        break;
                    default:
                        errorMessage = error.message;
                }
                console.error("Forgot password error:", error.code, error.message);
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
                    <h1 className="text-3xl font-bold">Reset Password</h1>
                    <p className="text-gray-600 mt-2">
                        Enter your email address to receive a password reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim())}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#0C713D] hover:bg-[#095e32]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </span>
                        ) : (
                            "Send Reset Link"
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

export default ForgotPassword;