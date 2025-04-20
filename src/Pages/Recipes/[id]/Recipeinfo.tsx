import { Link, useParams } from "react-router-dom";
import { Clock, Users, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Recipe, Comment } from "@/lib/types";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "@/server/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

const Recipeinfo = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: currentUser.uid,
            name: userData.name || "Anonymous User",
            avatar: userData.avatar || undefined,
          });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

// Fetch recipe and similar recipes
useEffect(() => {
  if (!id) {
    setError("Invalid recipe ID.");
    setLoading(false);
    return;
  }

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch recipe
      const recipeDoc = await getDoc(doc(db, "recipes", id));
      if (!recipeDoc.exists()) {
        throw new Error("Recipe not found.");
      }
      const recipeData = recipeDoc.data();

      // Fetch author's recipe count
      let recipesCount = 0;
      if (recipeData.author?.id) {
        const recipesQuery = query(
          collection(db, "recipes"),
          where("author.id", "==", recipeData.author.id)
        );
        const recipesSnapshot = await getDocs(recipesQuery);
        recipesCount = recipesSnapshot.size; // Count the number of recipes
      }

      // Normalize data to match Recipe type
      const normalizedRecipe: Recipe = {
        id: recipeDoc.id,
        name: recipeData.name || "Untitled Recipe",
        description: recipeData.description || "",
        image: recipeData.image || undefined,
        cookTime: recipeData.cookTime || 0,
        servings: recipeData.servings || 1,
        categories: recipeData.categories && Array.isArray(recipeData.categories) ? recipeData.categories : [],
        createdAt: recipeData.createdAt
          ? typeof recipeData.createdAt === "string"
            ? recipeData.createdAt
            : recipeData.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        approvalRating: recipeData.approvalRating || 0,
        votes: recipeData.votes || 0,
        ingredients: recipeData.ingredients && Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: recipeData.instructions && Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        tips: recipeData.tips && Array.isArray(recipeData.tips) ? recipeData.tips : undefined,
        author: recipeData.author && recipeData.author.id && recipeData.author.name
          ? {
              id: recipeData.author.id,
              name: recipeData.author.name,
              avatar: recipeData.author.avatar || undefined,
              bio: recipeData.author.bio || undefined,
              recipesCount, // Use dynamically fetched count
            }
          : { id: "unknown", name: "Anonymous User", recipesCount: 0 },
        comments: recipeData.comments && Array.isArray(recipeData.comments) ? recipeData.comments : [],
        voters: recipeData.voters && Array.isArray(recipeData.voters) ? recipeData.voters : [],
      };
      setRecipe(normalizedRecipe);

      // Fetch similar recipes (match any category)
      if (normalizedRecipe.categories.length > 0) {
        const similarQuery = query(
          collection(db, "recipes"),
          where("categories", "array-contains-any", normalizedRecipe.categories),
          where("__name__", "!=", id),
          limit(3)
        );
        const similarDocs = await getDocs(similarQuery);
        const similar = await Promise.all(similarDocs.docs.map(async (doc) => {
          const data = doc.data();
          // Fetch recipe count for similar recipes' authors
          let similarRecipesCount = 0;
          if (data.author?.id) {
            const similarRecipesQuery = query(
              collection(db, "recipes"),
              where("author.id", "==", data.author.id)
            );
            const similarRecipesSnapshot = await getDocs(similarRecipesQuery);
            similarRecipesCount = similarRecipesSnapshot.size;
          }
          return {
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
                  recipesCount: similarRecipesCount, // Use dynamically fetched count
                }
              : { id: "unknown", name: "Anonymous User", recipesCount: 0 },
            comments: data.comments && Array.isArray(data.comments) ? data.comments : [],
            voters: data.voters && Array.isArray(data.voters) ? data.voters : [],
          } as Recipe;
        }));
        setSimilarRecipes(similar);
      }
    } catch (err: unknown) {
      console.error("Error loading recipe:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);

  // Handle voting
  const handleVote = async () => {
    if (!user) {
      toast.error("Login Required", {
        description: "You must be logged in to vote.",
        action: { label: "Login", onClick: () => (window.location.href = "/auth/login") },
      });
      return;
    }
    if (!recipe || !id) return;

    // Check if user has already voted
    if (recipe.voters?.includes(user.id)) {
      toast.error("Already Voted", {
        description: "You have already voted for this recipe.",
      });
      return;
    }

    try {
      // Update Firestore: increment votes, adjust approvalRating, and add user to voters
      await updateDoc(doc(db, "recipes", id), {
        votes: recipe.votes + 1,
        approvalRating: Math.min(100, recipe.approvalRating + 10), // Example: +10% per vote, cap at 100
        voters: arrayUnion(user.id), // Add user ID to voters array
      });

      setRecipe((prev) =>
        prev
          ? {
            ...prev,
            votes: prev.votes + 1,
            approvalRating: Math.min(100, prev.approvalRating + 10),
            voters: [...(prev.voters || []), user.id],
          }
          : prev
      );

      toast.success("Success", { description: "Your vote has been recorded!" });
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Error", { description: "Failed to record vote. Please try again." });
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Login Required", {
        description: "You must be logged in to comment.",
        action: { label: "Login", onClick: () => window.location.href = "/auth/login" },
      });
      return;
    }
    if (!recipe || !id || !comment.trim()) {
      toast.error("Error", { description: "Comment cannot be empty." });
      return;
    }

    setIsSubmittingComment(true);
    try {
      const newComment: Comment = {
        id: `${user.id}-${Date.now()}`,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar || undefined,
        },
        content: comment.trim(),
        date: new Date().toISOString(),
      };
      await updateDoc(doc(db, "recipes", id), {
        comments: arrayUnion(newComment),
      });
      setRecipe((prev) => (prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev));
      setComment("");
      toast.success("Success", { description: "Comment added successfully!" });
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Error", { description: "Failed to add comment. Please try again." });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle sharing
  const handleShare = async () => {
    const shareData = {
      title: recipe?.name,
      text: `Check out this Sierra Leonean recipe: ${recipe?.name}!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Success", { description: "Link copied to clipboard!" });
      }
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Error", { description: "Failed to share recipe." });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container px-4 py-24 mx-auto max-w-7xl sm:py-40 text-center">
          <p>Loading recipe...</p>
        </div>
        <Footer />
      </>
    );
  }
  if (error) {
    return (
      <>
        <Navbar />
        <div className="container px-4 py-24 mx-auto max-w-7xl sm:py-40 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
        <Footer />
      </>
    );
  }
  if (!recipe) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-24 text-center">
          <p>No recipe found.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container px-4 py-24 mx-auto max-w-7xl sm:py-40">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Header */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={recipe.author.avatar || "/Images/placeholder.jpg"} alt={recipe.author.name} />
                    <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    By <Link to={`/users/${recipe.author.id}`} className="hover:text-[#0C713D]">{recipe.author.name}</Link>
                  </span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.cookTime} mins</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>

              {/* Community Approval */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Community Approval</span>
                  <span className="font-bold">{recipe.approvalRating}%</span>
                </div>
                <Progress value={recipe.approvalRating} className="h-2" />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{recipe.votes} votes</span>
                  {recipe.approvalRating >= 70 && <span className="text-[#0C713D] font-medium">Verified Recipe</span>}
                </div>
              </div>

              {/* Recipe Image */}
              <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
                <img
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.name}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About This Dish</h2>
                <p className="text-gray-700">{recipe.description}</p>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
                {recipe.ingredients.length > 0 ? (
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#0C713D] mt-2"></div>
                        <span>
                          {ingredient.quantity} {ingredient.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No ingredients listed.</p>
                )}
              </div>

              {/* Instructions */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Instructions</h2>
                {recipe.instructions.length > 0 ? (
                  <ol className="space-y-6">
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0C713D] text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500">No instructions provided.</p>
                )}
              </div>

              {/* Tips */}
              {recipe.tips && recipe.tips.length > 0 && (
                <div className="mb-8 bg-amber-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">Tips</h2>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Button
                  className="flex gap-2 bg-[#0C713D] hover:bg-[#095e32]"
                  onClick={handleVote}
                  disabled={!user || recipe.voters?.includes(user?.id || "")} 
                  aria-label="Vote for this recipe"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {recipe.voters?.includes(user?.id || "") ? "Voted" : "Vote (Approve)"}
                </Button>
                <Button
                  variant="outline"
                  className="flex gap-2"
                  onClick={() => document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" })}
                  aria-label="Add a comment"
                >
                  <MessageSquare className="h-4 w-4" />
                  Add Comment
                </Button>
                <Button
                  variant="outline"
                  className="flex gap-2"
                  onClick={handleShare}
                  aria-label="Share this recipe"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              {/* Comments */}
              <div id="comment-section" className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Comments ({recipe.comments?.length || 0})</h2>
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8 space-y-4">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this recipe..."
                      className="min-h-[100px]"
                      aria-label="Comment input"
                    />
                    <Button
                      type="submit"
                      className="bg-[#0C713D] hover:bg-[#095e32]"
                      disabled={isSubmittingComment || !comment.trim()}
                    >
                      {isSubmittingComment ? "Submitting..." : "Post Comment"}
                    </Button>
                  </form>
                ) : (
                  <p className="text-gray-500 mb-8">
                    <Link to="/auth/login" className="text-[#0C713D] hover:underline">Log in</Link> to add a comment.
                  </p>
                )}
                {(recipe.comments ?? []).length > 0 ? (
                  <div className="space-y-6">
                    {(recipe.comments ?? []).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar || "/Images/placeholder.jpg"} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link to={`/users/${comment.author.id}`} className="font-medium hover:text-[#0C713D]">
                              {comment.author.name}
                            </Link>
                            <div className="text-xs text-gray-500">
                              {new Date(comment.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Author */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">About the Author</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={recipe.author.avatar || "/Images/placeholder.jpg"} alt={recipe.author.name} />
                    <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link to={`/users/${recipe.author.id}`} className="font-medium hover:text-[#0C713D]">
                      {recipe.author.name}
                    </Link>
                    <div className="text-sm text-gray-500">{recipe.author.recipesCount} recipes</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-4">{recipe.author.bio || "No bio available."}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/users/${recipe.author.id}`}>View Profile</Link>
                </Button>
              </div>

              {/* Similar Recipes */}
              <div>
                <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
                {similarRecipes.length > 0 ? (
                  <div className="space-y-4">
                    {similarRecipes.map((similarRecipe) => (
                      <div key={similarRecipe.id} className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                          <img
                            src={similarRecipe.image || "/placeholder.svg"}
                            alt={similarRecipe.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <Link to={`/recipes/${similarRecipe.id}`} className="font-medium hover:text-[#0C713D]">
                            {similarRecipe.name}
                          </Link>
                          <div className="text-sm text-gray-500 mt-1">{similarRecipe.approvalRating}% Approval</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No similar recipes found.</p>
                )}
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xl font-bold mb-4">Categories</h3>
                {recipe.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recipe.categories.map((category) => (
                      <Link key={category} to={`/recipes?category=${encodeURIComponent(category)}`}>
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-[#0C713D] hover:text-white transition-colors">
                          {category}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No categories assigned.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Recipeinfo;