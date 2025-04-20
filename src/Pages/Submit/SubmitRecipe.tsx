import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "@/server/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, increment, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import type { User } from "firebase/auth";
import type { Author, Ingredient } from "@/lib/types";
import RecipeForm from "./RecipeForm";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";

const SubmitRecipe = () => {
  const [user, setUser] = useState<User | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAuthor({
              id: currentUser.uid,
              name: userData.name || "Anonymous User",
              avatar: userData.avatar || undefined,
              bio: userData.bio || undefined,
              recipesCount: userData.recipesCount || 0,
            });
          } else {
            console.warn(`No user profile found for UID: ${currentUser.uid}`);
            toast.error("Error", { description: "User profile not found. Please contact support." });
            navigate("/auth/login");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Error", { description: "Failed to load user profile. Please try again." });
        }
      } else {
        toast("Login Required", {
          description: "You must be logged in to submit a recipe.",
          action: { label: "Login", onClick: () => navigate("/auth/login") },
        });
        navigate("/auth/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (
    formData: FormData,
    ingredients: Ingredient[],
    instructions: string[],
    tips: string[],
    categories: string[]
  ) => {
    if (!user || !author) {
      throw new Error("User not authenticated");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const cookTime = parseInt(formData.get("cookTime") as string);
    const servings = parseInt(formData.get("servings") as string);
    const image = formData.get("image") as File;

    let imageUrl: string | undefined;
    if (image && image.size > 0) {
      const imageRef = ref(storage, `recipes/${user.uid}/${Date.now()}-${image.name}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    const recipeData = {
      name: name.trim(),
      description: description.trim(),
      cookTime,
      servings,
      categories,
      ingredients,
      instructions,
      tips: tips.length > 0 ? tips : undefined,
      image: imageUrl || undefined,
      author,
      approvalRating: 0,
      votes: 0,
      comments: [],
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "recipes"), recipeData);

    await updateDoc(doc(db, "users", user.uid), {
      recipesCount: increment(1),
    });

    toast.success("Success", {
      description: "Your recipe has been submitted successfully!",
      action: { label: "View Recipes", onClick: () => navigate("/recipes") },
    });
    navigate("/submission-success");
  };

  if (!user || !author) {
    return null;
  }

  return (
    <>
    <Navbar/>
    <div className="container mx-auto px-4 py-20 sm:py-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Submit a Recipe</h1>
        <p className="text-gray-600 mb-8">
          Share your favorite Sierra Leonean recipe with our community. Recipes with a 70% or higher approval rating
          will be featured in our main collection.
        </p>
        <RecipeForm mode="add" onSubmit={handleSubmit} />
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default SubmitRecipe;