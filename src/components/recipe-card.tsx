import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/server/firebase";
import { toast } from "sonner";

interface RecipeCardProps {
  recipe?: Recipe;
  recipeId?: string; 
}

export function RecipeCard({ recipe: propRecipe, recipeId }: RecipeCardProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(propRecipe || null);
  const [loading, setLoading] = useState(!propRecipe && !!recipeId);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipe if recipeId is provided and no propRecipe
  useEffect(() => {
    if (propRecipe || !recipeId) return;

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
        if (!recipeDoc.exists()) {
          throw new Error("Recipe not found.");
        }

        const data = recipeDoc.data();
        // Normalize data to match Recipe type
        const normalizedRecipe: Recipe = {
          id: recipeDoc.id,
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
          votes: data.votes || 0,
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
        };
        setRecipe(normalizedRecipe);
      } catch (err: unknown) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe.");
        toast.error("Error", { description: "Failed to load recipe. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [propRecipe, recipeId]);

  if (loading) {
    return <div className="text-center p-4">Loading recipe...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  if (!recipe || !recipe.author) {
    console.warn("RecipeCard: Missing recipe or author data");
    return null;
  }

  // Normalize categories to prevent TypeError
  const displayedCategories = (recipe.categories || []).slice(0, 3);

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md">
      <Link to={`/recipes/${recipe.id}`} className="block" aria-label={`View ${recipe.name} recipe`}>
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={recipe.image || "/Images/placeholder.jpg"}
            alt={recipe.name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {recipe.approvalRating >= 70 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-[#0C713D]">Verified</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-[#0C713D] transition-colors">{recipe.name}</h3>
          <p className="text-sm text-gray-500 mb-3">
            By <Link to={`/users/${recipe.author.id}`} className="hover:text-[#0C713D]">{recipe.author.name}</Link>
          </p>

          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookTime || "N/A"} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings || "N/A"} servings</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Community Rating</span>
              <span className="font-medium">{recipe.approvalRating}%</span>
            </div>
            <Progress value={recipe.approvalRating} className="h-1" />
          </div>

          {displayedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {displayedCategories.map((category) => (
                <Link
                  key={category}
                  to={`/recipes?category=${encodeURIComponent(category)}`}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-[#0C713D] hover:text-white transition-colors"
                >
                  {category}
                </Link>
              ))}
              {recipe.categories.length > 3 && (
                <span className="text-xs text-gray-500">+{recipe.categories.length - 3} more</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No categories</p>
          )}
        </div>
      </Link>
    </div>
  );
}