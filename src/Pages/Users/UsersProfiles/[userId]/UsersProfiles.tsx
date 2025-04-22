import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/server/firebase";
import { Calendar, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCard } from "@/components/recipe-card";
import type { Recipe, User } from "@/lib/types";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import { normalizeRecipe } from "@/utils/firestore";
import Loading from "@/components/Loading";

const UsersProfiles = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndRecipes = async () => {
      if (!userId) {
        setError("Invalid user ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
          setError("User profile not found");
          setLoading(false);
          return;
        }

        const userData = userDoc.data();

        // Format joinedAt
        let formattedJoinedAt = "Unknown";
        const rawJoinedAt = userData.joinedAt || userData.joinAt;
        if (rawJoinedAt) {
          if (typeof rawJoinedAt === "string") {
            // Assume ISO string or custom string
            formattedJoinedAt = new Date(rawJoinedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } else if (rawJoinedAt.toDate) {
            // Firestore Timestamp
            formattedJoinedAt = rawJoinedAt.toDate().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }
        }

        // Fetch user's recipes (removed status filter to broaden results)
        const recipesQuery = query(
          collection(db, "recipes"),
          where("author.id", "==", userId)
        );
        const recipesSnap = await getDocs(recipesQuery);
        const fetchedRecipes = recipesSnap.docs.map((doc) => normalizeRecipe(doc));

        setUser({
          id: userId,
          name: userData.name || "Anonymous User",
          email: userData.email || "No email provided",
          avatar: userData.avatar,
          bio: userData.bio,
          joinedAt: formattedJoinedAt || "Unknown",
          recipesCount: recipesSnap.size, 
        });
        setRecipes(fetchedRecipes);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRecipes();
  }, [userId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="flex justify-center items-center h-64">
            <Loading />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !user) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-20 sm:py-32">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="h-32 w-32 rounded-full  border-2 border-[#0C713D] overflow-hidden">
                  <img
                    src={user.avatar || "/Images/placeholder.jpg"}
                    alt={user.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Member since {user.joinedAt}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="font-medium mb-4">About</h2>
              <p className="text-gray-600">{user.bio || "This user hasn't added a bio yet."}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="font-medium mb-4">Stats</h2>
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[#0C713D] mr-1" />
                  <span className="text-2xl font-bold">{user.recipesCount}</span>
                </div>
                <p className="text-sm text-gray-500">Recipes</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="recipes" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="recipes">Recipes</TabsTrigger>
              </TabsList>

              <TabsContent value="recipes" className="space-y-6">
                <h2 className="text-xl font-bold">{user.name}'s Recipes</h2>
                {recipes.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No recipes yet</h3>
                    <p className="text-gray-500">{user.name} hasn't published any recipes yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UsersProfiles;