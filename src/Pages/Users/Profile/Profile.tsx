import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast, Toaster } from "sonner";
import { RecipeCard } from "@/components/recipe-card";
import Sidebar from "../Components/Sidebar";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import { auth, db, storage } from "@/server/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import type { User, Recipe } from "@/lib/types";
import { normalizeRecipe } from "@/utils/firestore";
import Loading from "@/components/Loading";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<User | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setError("You must be logged in to view this page.");
                navigate("/auth/login");
                return;
            }

            try {
                setLoading(true);

                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({
                        id: user.uid,
                        name: data.name || user.displayName || "Anonymous User",
                        email: data.email || user.email || "",
                        avatar: data.avatar || undefined,
                        bio: data.bio || undefined,
                        recipesCount: data.recipesCount || 0,
                        joinedAt: data.joinedAt || new Date().toISOString(),
                    });
                } else {
                    const newProfile: User = {
                        id: user.uid,
                        name: user.displayName || "Anonymous User",
                        email: user.email || "",
                        avatar: user.photoURL || undefined,
                        bio: undefined,
                        recipesCount: 0,
                        joinedAt: new Date().toISOString(),
                    };
                    const profileForFirestore = {
                        id: newProfile.id,
                        name: newProfile.name,
                        email: newProfile.email,
                        recipesCount: newProfile.recipesCount,
                        joinedAt: newProfile.joinedAt,
                        ...(newProfile.avatar && { avatar: newProfile.avatar }),
                        ...(newProfile.bio && { bio: newProfile.bio }),
                    };
                    await setDoc(doc(db, "users", user.uid), profileForFirestore);
                    setProfile(newProfile);
                }

                const recipesQuery = query(
                    collection(db, "recipes"),
                    where("author.id", "==", user.uid)
                );
                const snapshot = await getDocs(recipesQuery);
                const userRecipes = snapshot.docs.map((doc) => normalizeRecipe(doc));
                setRecipes(userRecipes);

                await setDoc(doc(db, "users", user.uid), { recipesCount: userRecipes.length }, { merge: true });
                setProfile((prev) => prev ? { ...prev, recipesCount: userRecipes.length } : prev);
            } catch (err: unknown) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile. Please try again.");
                toast.error("Error", { description: "Failed to load profile. Please try again." });
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !auth.currentUser) return;

        setIsSaving(true);

        try {
            let avatarUrl = profile.avatar;

            if (avatarFile) {
                if (!["image/jpeg", "image/png", "image/webp"].includes(avatarFile.type)) {
                  throw new Error("Avatar must be JPEG, PNG, or WEBP.");
                }
                if (avatarFile.size > 5 * 1024 * 1024) {
                  throw new Error("Avatar must be less than 5MB.");
                }
                const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${avatarFile.name}`);
                await uploadBytes(storageRef, avatarFile);
                avatarUrl = await getDownloadURL(storageRef);
              }

            const updatedProfile: User = {
                id: profile.id,
                name: profile.name.trim(),
                email: profile.email.trim(),
                avatar: avatarUrl,
                bio: profile.bio?.trim() || undefined,
                recipesCount: profile.recipesCount,
                joinedAt: profile.joinedAt,
            };
            const profileForFirestore = {
                id: updatedProfile.id,
                name: updatedProfile.name,
                email: updatedProfile.email,
                recipesCount: updatedProfile.recipesCount,
                joinedAt: updatedProfile.joinedAt,
                ...(updatedProfile.avatar && { avatar: updatedProfile.avatar }),
                ...(updatedProfile.bio && { bio: updatedProfile.bio }),
            };

            await setDoc(doc(db, "users", profile.id), profileForFirestore, { merge: true });
            setProfile(updatedProfile);
            setAvatarFile(null);
            setIsEditing(false);
            toast.success("Profile updated", {
                description: "Your profile has been updated successfully.",
            });
        } catch (err: unknown) {
            console.error("Error saving profile:", err);
            toast.error("Error", { description: "Failed to save profile. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="py-20 sm:py-32 container mx-auto px-4 md:px-6 max-w-6xl">
                    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
                        <Sidebar />
                        <main className="flex w-full flex-col mx-auto overflow-hidden justify-center items-center h-64">
                            <Loading/>
                        </main>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="py-20 sm:py-32 container mx-auto px-4 md:px-6 max-w-6xl text-red-600">
                    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
                        <Sidebar />
                        <main className="flex w-full flex-col overflow-hidden">
                            {error}
                            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
                        </main>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="py-20 sm:py-32 container mx-auto px-4 md:px-6 max-w-6xl">
                <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
                    <Sidebar />
                    <main className="flex w-full flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">My Profile</h1>
                            {!isEditing && (
                                <Button onClick={() => setIsEditing(true)} className="bg-[#0C713D] hover:bg-[#095e32]">
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative">
                                        <Avatar className="h-36 w-36 sm:h-28 sm:w-28 md:h-36 md:w-36 rounded-full border-[#095e32] border-2 overflow-hidden">
                                            <AvatarImage
                                                className="w-full h-full object-cover "
                                                src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar || "/Images/placeholder.jpg"}
                                                alt={profile.name}
                                            />
                                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 bg-[#0C713D] rounded-full p-1 cursor-pointer">
                                            <Camera className="h-4 w-4 text-white" />
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                aria-label="Upload profile picture"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Click the camera icon to change your profile picture</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                            required
                                            aria-required="true"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            required
                                            aria-required="true"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={profile.bio || ""}
                                        onChange={handleChange}
                                        className="min-h-[100px]"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-[#0C713D] hover:bg-[#095e32]" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <Avatar className="h-36 w-36 sm:h-28 sm:w-28 md:h-36 md:w-36 rounded-full border-[#095e32] border-2 overflow-hidden">
                                        <AvatarImage className="w-full h-full object-cover " src={profile.avatar || "/Images/placeholder.jpg"} alt={profile.name} />
                                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                        <p className="mt-1">{profile.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                        <p className="mt-1">{profile.email}</p>
                                    </div>
                                </div>

                                {profile.bio && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                        <p className="mt-1">{profile.bio}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                                    <p className="mt-1">{new Date(profile.joinedAt).toLocaleDateString()}</p>
                                </div>

                                <div className="mt-8">
                                    <h2 className="text-2xl font-bold mb-4">My Recipes ({recipes.length})</h2>
                                    {recipes.length > 0 ? (
                                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {recipes.map((recipe) => (
                                                <RecipeCard key={recipe.id} recipe={recipe} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center">
                                            You haven't submitted any recipes yet.{" "}
                                            <Button asChild variant="link" className="text-[#0C713D] p-0">
                                                <Link to="/submit-recipe">Submit one now!</Link>
                                            </Button>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
            <Toaster richColors position="top-center" closeButton={false} />
        </>
    );
};

export default Profile;