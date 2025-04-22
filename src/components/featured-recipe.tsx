import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/lib/types";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/server/firebase";
import { toast, Toaster } from "sonner";
import { normalizeRecipe } from "@/utils/firestore";
import Loading from "./Loading";

interface FeaturedRecipeProps {
  recipe?: Recipe;
}

export function FeaturedRecipe({ recipe: propRecipe }: FeaturedRecipeProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(propRecipe || null);
  const [loading, setLoading] = useState(!propRecipe);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured recipe if not provided via props
  useEffect(() => {
    if (propRecipe) return;

    const fetchFeaturedRecipe = async () => {
      try {
        setLoading(true);
        // Fetch recipe with highest approvalRating or most recent
        const recipesQuery = query(
          collection(db, "recipes"),
          orderBy("approvalRating", "desc"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(recipesQuery);
        if (snapshot.empty) {
          throw new Error("No recipes found.");
        }

        const doc = snapshot.docs[0];
        const normalizedRecipe = normalizeRecipe(doc); 
        setRecipe(normalizedRecipe);
      } catch (err: unknown) {
        console.error("Error fetching featured recipe:", err);
        setError("Failed to load featured recipe.");
        toast.error("Error", { description: "Failed to load featured recipe. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRecipe();
  }, [propRecipe]);

  if (loading) {
    return <div className="text-center p-6">
      <Loading/>
    </div>;
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        {error}
        <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
      </div>
    );
  }

  if (!recipe) {
    toast.warning("FeaturedRecipe", { description: " Missing recipe data" });
    return null;
  }
  if (recipe.author.id === "unknown") {
    toast.warning("FeaturedRecipe", { description: " Recipe has default anonymous author" });
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 bg-gray-50 rounded-xl overflow-hidden">
      <div className="relative h-[300px] md:h-auto">
        <img
          src={recipe.image ?? "/Images/placeholder.jpg"}
          alt={recipe.name}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {recipe.approvalRating >= 70 && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-[#0C713D]">Community Verified</Badge>
          </div>
        )}
      </div>
      <div className="p-6 md:p-8 flex flex-col">
        <h3 className="text-2xl font-bold mb-2">{recipe.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative h-6 w-6 rounded-full overflow-hidden">
            <img
              src={recipe.author.avatar ?? "/Images/placeholder.jpg"}
              alt={recipe.author.name}
              className="object-cover"
              loading="lazy"
            />
          </div>
          <span className="text-sm text-gray-600">
            By <Link to={`/users/${recipe.author.id}`} className="hover:text-[#0C713D]">{recipe.author.name}</Link>
          </span>
        </div>

        <p className="text-gray-700 mb-6 line-clamp-4">{recipe.description || "No description available."}</p>

        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookTime} mins</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        <div className="mt-auto">
          <Button asChild className="bg-[#0C713D] hover:bg-[#095e32] flex gap-2">
            <Link to={`/recipes/${recipe.id}`} aria-label={`View ${recipe.name} recipe`}>
              View Recipe
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <Toaster richColors position="top-center" closeButton={false} />
    </div>
  );
}