import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, MoreHorizontal, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { toast, Toaster } from "sonner";
import { Footer } from "@/components/utils/Footer";
import Sidebar from "../Components/Sidebar";
import { Navbar } from "@/components/utils/Navbar";
import { auth, db } from "@/server/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import type { Recipe } from "@/lib/types";

const MyRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const recipesQuery = query(
          collection(db, "recipes"),
          where("author.id", "==", user.uid)
        );
        const snapshot = await getDocs(recipesQuery);
        const userRecipes = snapshot.docs.map((doc) => {
          const data = doc.data();
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
            voteCount: data.voteCount || data.votes || 0,
            ingredients: data.ingredients && Array.isArray(data.ingredients) ? data.ingredients : [],
            instructions: data.instructions && Array.isArray(data.instructions) ? data.instructions : [],
            tips: data.tips && Array.isArray(data.tips) ? data.tips : undefined,
            author: {
              id: data.author.id,
              name: data.author.name,
              avatar: data.author.avatar || undefined,
              bio: data.author.bio || undefined,
              recipesCount: data.author.recipesCount || 0,
            },
            comments: data.comments && Array.isArray(data.comments) ? data.comments : [],
            status: data.status || "draft",
            votes: data.votes && Array.isArray(data.votes)
              ? data.votes
              : data.voters && Array.isArray(data.voters)
                ? data.voters.map((userId: string) => ({ userId, type: "up" }))
                : [],
          } as Recipe;
        });
        setRecipes(userRecipes);
      } catch (err: unknown) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes. Please try again.");
        toast.error("Error", { description: "Failed to load recipes. Please try again." });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDeleteClick = (recipeId: string) => {
    setRecipeToDelete(recipeId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    try {
      await deleteDoc(doc(db, "recipes", recipeToDelete));
      setRecipes(recipes.filter((recipe) => recipe.id !== recipeToDelete));
      toast.success("Recipe deleted", {
        description: "Your recipe has been deleted successfully.",
      });
    } catch (err: unknown) {
      console.error("Error deleting recipe:", err);
      toast.error("Error", { description: "Failed to delete recipe. Please try again." });
    } finally {
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const handleSubmitForReview = async (recipeId: string) => {
    try {
      await setDoc(doc(db, "recipes", recipeId), { status: "pending" }, { merge: true });
      setRecipes(
        recipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, status: "pending" } : recipe
        )
      );
      toast.success("Recipe submitted", {
        description: "Your recipe has been submitted for community review.",
      });
    } catch (err: unknown) {
      console.error("Error submitting recipe for review:", err);
      toast.error("Error", { description: "Failed to submit recipe for review. Please try again." });
    }
  };

  const handlePublishRecipe = async (recipeId: string) => {
    try {
      await setDoc(doc(db, "recipes", recipeId), { status: "published" }, { merge: true });
      setRecipes(
        recipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, status: "published" } : recipe
        )
      );
      toast.success("Recipe published", {
        description: "Your recipe is now live for the community to view and vote on.",
      });
    } catch (err: unknown) {
      console.error("Error publishing recipe:", err);
      toast.error("Error", { description: "Failed to publish recipe. Please try again." });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="py-20 sm:py-32 container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
            <Sidebar />
            <main className="flex w-full flex-col overflow-hidden">
              Loading recipes...
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
        <div className="py-20 sm:py-32 container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
            <Sidebar />
            <main className="flex w-full flex-col overflow-hidden">
              {error}
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </main>
          </div>
        </div>
        <Footer />
      </>
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
              <h1 className="text-2xl font-bold">My Recipes</h1>
              <Link to="/submit-recipe">
                <Button className="bg-[#0C713D] hover:bg-[#095e32]">
                  <Plus className="mr-2 h-4 w-4" />
                  New Recipe
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Recipes</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {recipes.length > 0 ? (
                  recipes.map((recipe) => (
                    <div key={recipe.id} className="flex border rounded-lg overflow-hidden">
                      <div className="relative h-32 w-32 flex-shrink-0">
                        <img
                          src={recipe.image || "/Images/placeholder.jpg"}
                          alt={recipe.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{recipe.name}</h3>
                            {getStatusBadge(recipe.status || "draft")}
                          </div>
                          <p className="text-sm text-gray-500">
                            {recipe.status === "published"
                              ? `Published on ${new Date(recipe.createdAt).toLocaleDateString()}`
                              : recipe.status === "pending"
                              ? `Submitted on ${new Date(recipe.createdAt).toLocaleDateString()}`
                              : `Last edited on ${new Date(recipe.createdAt).toLocaleDateString()}`}
                          </p>
                          {recipe.status === "published" && (
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm">{recipe.approvalRating}% Approval</span>
                              <span className="text-sm">{recipe.voteCount} Votes</span>
                            </div>
                          )}
                          {recipe.status === "pending" && (
                            <p className="text-sm text-amber-600 mt-1">
                              Your recipe is being reviewed by the community
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/recipes/${recipe.id}`}>
                              {recipe.status === "published" ? "View" : "Preview"}
                            </Link>
                          </Button>
                          {recipe.status !== "published" && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="flex items-center gap-1"
                            >
                              <Link to={`/edit-recipe/${recipe.id}`}>
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </Button>
                          )}
                          {recipe.status === "pending" && (
                            <Button
                              size="sm"
                              className="bg-[#0C713D] hover:bg-[#095e32]"
                              onClick={() => handlePublishRecipe(recipe.id)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Publish Now
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeleteClick(recipe.id)}>
                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-red-500">Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No recipes yet</h3>
                    <p className="text-gray-500 mb-6">
                      Start sharing your favorite Sierra Leonean recipes with the community
                    </p>
                    <Link to="/submit-recipe">
                      <Button className="bg-[#0C713D] hover:bg-[#095e32]">
                        Create Your First Recipe
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="published">
                {recipes.filter((r) => r.status === "published").length > 0 ? (
                  <div className="space-y-6">
                    {recipes
                      .filter((r) => r.status === "published")
                      .map((recipe) => (
                        <div key={recipe.id} className="flex border rounded-lg overflow-hidden">
                          <div className="relative h-32 w-32 flex-shrink-0">
                            <img
                              src={recipe.image || "/Images/placeholder.jpg"}
                              alt={recipe.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{recipe.name}</h3>
                                {getStatusBadge(recipe.status || "draft")}
                              </div>
                              <p className="text-sm text-gray-500">
                                Published on {new Date(recipe.createdAt).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm">{recipe.approvalRating}% Approval</span>
                                <span className="text-sm">{recipe.voteCount} Votes</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/recipes/${recipe.id}`}>View</Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex items-center gap-1"
                              >
                                <Link to={`/edit-recipe/${recipe.id}`}>
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteClick(recipe.id)}>
                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="text-red-500">Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No published recipes</h3>
                    <p className="text-gray-500 mb-6">Your published recipes will appear here</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts">
                {recipes.filter((r) => r.status === "draft").length > 0 ? (
                  <div className="space-y-6">
                    {recipes
                      .filter((r) => r.status === "draft")
                      .map((recipe) => (
                        <div key={recipe.id} className="flex border rounded-lg overflow-hidden">
                          <div className="relative h-32 w-32 flex-shrink-0">
                            <img
                              src={recipe.image || "/Images/placeholder.jpg"}
                              alt={recipe.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{recipe.name}</h3>
                                {getStatusBadge(recipe.status || "draft")}
                              </div>
                              <p className="text-sm text-gray-500">
                                Last edited on {new Date(recipe.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex items-center gap-1"
                              >
                                <Link to={`/edit-recipe/${recipe.id}`}>
                                  <Edit className="h-4 w-4" />
                                  Continue Editing
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#0C713D] hover:bg-[#095e32]"
                                onClick={() => handleSubmitForReview(recipe.id)}
                              >
                                Submit for Review
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteClick(recipe.id)}>
                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="text-red-500">Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No draft recipes</h3>
                    <p className="text-gray-500 mb-6">Your draft recipes will appear here</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending">
                {recipes.filter((r) => r.status === "pending").length > 0 ? (
                  <div className="space-y-6">
                    {recipes
                      .filter((r) => r.status === "pending")
                      .map((recipe) => (
                        <div key={recipe.id} className="flex border rounded-lg overflow-hidden">
                          <div className="relative h-32 w-32 flex-shrink-0">
                            <img
                              src={recipe.image || "/Images/placeholder.jpg"}
                              alt={recipe.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{recipe.name}</h3>
                                {getStatusBadge(recipe.status || "draft")}
                              </div>
                              <p className="text-sm text-gray-500">
                                Submitted on {new Date(recipe.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-amber-600 mt-1">
                                Your recipe is being reviewed by the community
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/recipes/${recipe.id}`}>Preview</Link>
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#0C713D] hover:bg-[#095e32]"
                                onClick={() => handlePublishRecipe(recipe.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Publish Now
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteClick(recipe.id)}>
                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="text-red-500">Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No pending recipes</h3>
                    <p className="text-gray-500 mb-6">
                      Recipes awaiting community review will appear here
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your recipe from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </div>
      </div>
      <Footer />
      <Toaster richColors position="top-center" closeButton={false} />
    </>
  );
};

export default MyRecipes;