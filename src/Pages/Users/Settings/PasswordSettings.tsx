import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { Footer } from "@/components/utils/Footer";
import { Navbar } from "@/components/utils/Navbar";
import Sidebar from "../Components/Sidebar";
import { auth, db } from "@/server/firebase";
import {
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
  deleteUser,
  signOut,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";

const PasswordSettings = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError("You must be logged in to access this page.");
        navigate("/auth/login");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must include at least one number.";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must include at least one special character.";
    }
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setIsSaving(false);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsSaving(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No authenticated user found.");
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
      toast.success("Password updated", {
        description: "Your password has been changed successfully.",
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to update password. Please try again.";
      if (err instanceof Error && "code" in err) {
        switch ((err as { code: string }).code) {
          case "auth/wrong-password":
            errorMessage = "Current password is incorrect.";
            break;
          case "auth/weak-password":
            errorMessage = "New password is too weak.";
            break;
          case "auth/requires-recent-login":
            errorMessage = "Please log in again to update your password.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Please try again later.";
            break;
        }
      }
      setError(errorMessage);
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No authenticated user found.");
      }

      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // Delete the user account
      await deleteUser(user);

      // Sign out and redirect
      await signOut(auth);
      toast.success("Account deleted", {
        description: "Your account has been successfully deleted.",
      });
      navigate("/");
    } catch (err: unknown) {
      let errorMessage = "Failed to delete account. Please try again.";
      if (err instanceof Error && "code" in err) {
        switch ((err as { code: string }).code) {
          case "auth/wrong-password":
            errorMessage = "Password is incorrect.";
            break;
          case "auth/requires-recent-login":
            errorMessage = "Please log in again to delete your account.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Please try again later.";
            break;
        }
      }
      setError(errorMessage);
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsSaving(false);
      setDeletePassword("");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        Loading...
      </div>
    );
  }

  if (error && !isChangingPassword && !isDeletingAccount) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-red-600">
        {error}
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="py-20 sm:py-32 container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
          <Sidebar />
          <main className="flex w-full flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Security</h1>
            </div>

            <div className="space-y-8">
              {/* Password Change Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Key className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium">Password</h2>
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4 pl-7">
                    {error && (
                      <p className="text-red-600 text-sm" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        aria-required="true"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        aria-required="true"
                        aria-describedby="password-requirements"
                      />
                      <p id="password-requirements" className="text-xs text-gray-500">
                        Password must be at least 8 characters and include a number and special character.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        aria-required="true"
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setError(null);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#0C713D] hover:bg-[#095e32]"
                        disabled={isSaving}
                      >
                        {isSaving ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="pl-7">
                    <p className="text-gray-600 mb-4">
                      We recommend changing your password regularly to keep your account secure.
                    </p>
                    <Button
                      className="bg-[#0C713D] hover:bg-[#095e32]"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </div>

              {/* Delete Account Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-medium">Delete Account</h2>
                </div>

                {isDeletingAccount ? (
                  <form onSubmit={handleDeleteAccount} className="space-y-4 pl-7">
                    {error && (
                      <p className="text-red-600 text-sm" role="alert">
                        {error}
                      </p>
                    )}
                    <p className="text-gray-600 mb-4">
                      Deleting your account is permanent and cannot be undone. This will remove your user profile and
                      associated data.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="delete-password">Enter Password to Confirm</Label>
                      <Input
                        id="delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        required
                        aria-required="true"
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDeletingAccount(false);
                          setError(null);
                          setDeletePassword("");
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={isSaving}
                      >
                        {isSaving ? "Deleting..." : "Delete Account"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="pl-7">
                    <p className="text-gray-600 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeletingAccount(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
      <Toaster richColors position="top-center" closeButton={false} />
    </>
  );
};

export default PasswordSettings;