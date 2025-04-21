import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/lib/types";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/server/firebase";
import { toast, Toaster } from "sonner";

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
        const data = doc.data();
        // Normalize data to match Recipe type
        const normalizedRecipe: Recipe = {
          id: doc.id,
          name: data.name || "Untitled Recipe",
          description: data.description || "",
          image: data.image || undefined,
          cookTime: data.cookTime || 0,
          servings: data.servings || 1,
          categories: data.categories && Array.isArray(data.categories) ? data.categories : [],
          createdAt: data.createdAt
            ? typeof data.createdAt === "string"
              ? data.createdAt
              : data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          approvalRating: data.approvalRating || 0,
          voteCount: data.voteCount || data.votes || 0, // Fallback to old votes field if migration not complete
          ingredients: data.ingredients && Array.isArray(data.ingredients) ? data.ingredients : [],
          instructions: data.instructions && Array.isArray(data.instructions) ? data.instructions : [],
          tips: data.tips && Array.isArray(data.tips) ? data.tips : undefined,
          author: data.author && data.author.id && data.author.name
            ? {
                id: data.author.id,
                name: data.author.name,
                avatar: data.author.avatar || undefined,
                bio: data.author.bio || undefined,
                recipesCount: data.author.recipesCount || 0,
              }
            : { id: "unknown", name: "Anonymous User", recipesCount: 0 },
          comments: data.comments && Array.isArray(data.comments) ? data.comments : [],
          status: data.status || "published",
          votes: data.votes && Array.isArray(data.votes)
            ? data.votes
            : data.voters && Array.isArray(data.voters)
              ? data.voters.map((userId: string) => ({ userId, type: "up" })) // Migrate old voters
              : [],
        };
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
    return <div className="text-center p-6">Loading featured recipe...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        {error}
        <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
      </div>
    );
  }

  if (!recipe || !recipe.author) {
    console.warn("FeaturedRecipe: Missing recipe or author data");
    return null;
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
            <span>{recipe.cookTime || "N/A"} mins</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{recipe.servings || "N/A"} servings</span>
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