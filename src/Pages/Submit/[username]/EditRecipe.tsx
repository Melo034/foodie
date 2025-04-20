import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db, storage } from "@/server/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import type { User } from "firebase/auth";
import type { Recipe, Ingredient } from "@/lib/types";
import RecipeForm from "../RecipeForm";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";

const EditRecipe = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (!currentUser || !id) {
                setError("You must be logged in to edit a recipe.");
                navigate("/auth/login");
                return;
            }

            try {
                const docRef = doc(db, "recipes", id);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    setError("Recipe not found.");
                    navigate("/account/my-recipes");
                    return;
                }

                const recipeData = { id: docSnap.id, ...docSnap.data() } as Recipe;
                if (recipeData.author.id !== currentUser.uid) {
                    setError("You can only edit your own recipes.");
                    navigate("/account/my-recipes");
                    return;
                }

                setRecipe(recipeData);
            } catch (err) {
                console.error("Error fetching recipe:", err);
                setError("Failed to load recipe. Please try again.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [id, navigate]);

    const handleSubmit = async (
        formData: FormData,
        ingredients: Ingredient[],
        instructions: string[],
        tips: string[],
        categories: string[]
    ) => {
        if (!user || !recipe || !id) {
            throw new Error("User or recipe not found");
        }

        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const cookTime = parseInt(formData.get("cookTime") as string);
        const servings = parseInt(formData.get("servings") as string);
        const image = formData.get("image") as File;

        let imageUrl = recipe.image;
        if (image && image.size > 0) {
            const imageRef = ref(storage, `recipes/${user.uid}/${Date.now()}-${image.name}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }

        const updatedRecipeData = {
            name: name.trim(),
            description: description.trim(),
            cookTime,
            servings,
            categories,
            ingredients,
            instructions,
            tips: tips.length > 0 ? tips : undefined,
            image: imageUrl || undefined,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, "recipes", id), updatedRecipeData);

        toast.success("Success", {
            description: "Your recipe has been updated successfully!",
            action: { label: "View Recipes", onClick: () => navigate("/account/my-recipes") },
        });
        navigate("/account/my-recipes");
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 py-20 sm:py-32">
                    <div className="max-w-3xl mx-auto">
                        Loading...
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !recipe) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 py-20 sm:py-32">
                    <div className="max-w-3xl mx-auto text-red-600">
                        {error || "Recipe not found"}
                        <button
                            onClick={() => navigate("/account/my-recipes")}
                            className="mt-4 text-[#0C713D] hover:underline"
                        >
                            Back to My Recipes
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-20 sm:py-32">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Edit Recipe: {recipe.name}</h1>
                    <p className="text-gray-600 mb-8">
                        Update your Sierra Leonean recipe. Ensure it meets our{" "}
                        <a href="/community-guidelines" className="text-[#0C713D] hover:underline">
                            community guidelines
                        </a>
                        .
                    </p>
                    <RecipeForm
                        mode="edit"
                        initialData={recipe}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EditRecipe;