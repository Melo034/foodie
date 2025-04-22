import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import hero from "../../assets/Hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipeCard } from "@/components/recipe-card";
import { FeaturedRecipe } from "@/components/featured-recipe";
import { Recipe } from "@/lib/types";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/server/firebase";
import { toast, Toaster } from "sonner";
import { normalizeRecipe } from "@/utils/firestore";
import Loading from "@/components/Loading";

const Home = () => {
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopRecipes = async () => {
      try {
        setLoading(true);
        let recipesQuery;

        try {
          recipesQuery = query(
            collection(db, "recipes"),
            orderBy("approvalRating", "desc"),
            orderBy("voteCount", "desc"),
            limit(3)
          );
          const snapshot = await getDocs(recipesQuery);
          if (snapshot.empty) {
            setTopRecipes([]);
            return;
          }

          const recipes = snapshot.docs.map((doc) => normalizeRecipe(doc));
          setTopRecipes(recipes);
        } catch (indexError: unknown) {
          if (
            typeof indexError === "object" &&
            indexError !== null &&
            "code" in indexError &&
            "message" in indexError &&
            (indexError as { code: string; message: string }).code === "failed-precondition" &&
            (indexError as { code: string; message: string }).message.includes("requires an index")
          ) {
            recipesQuery = query(
              collection(db, "recipes"),
              orderBy("approvalRating", "desc"),
              limit(3)
            );
            const snapshot = await getDocs(recipesQuery);
            if (snapshot.empty) {
              setTopRecipes([]);
              return;
            }

            const recipes = snapshot.docs.map((doc) => normalizeRecipe(doc));
            setTopRecipes(recipes);
          } else {
            throw indexError;
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching top recipes:", err);
        setError("Failed to load recipes. Please try again.");
        toast.error("Error", { description: "Failed to load recipes. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    fetchTopRecipes();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  return (
    <div>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-[#0C713D]/10 py-20 md:py-32">
          <div className="container mx-auto max-w-7xl px-4 grid gap-6 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                Discover Authentic Sierra Leonean Cuisine
              </h1>
              <p className="text-xl text-gray-600">
                Explore traditional recipes, share your family favorites, and connect with a community of food lovers.
              </p>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for recipes or ingredients..."
                  className="pl-10 py-6 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search recipes"
                />
              </form>
              <div className="flex gap-4">
                <Button asChild className="bg-[#0C713D] hover:bg-[#095e32]">
                  <Link to="/recipes">Browse Recipes</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/submit-recipe">Submit a Recipe</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img
                src={hero}
                alt="Sierra Leonean Food"
                className="object-cover rounded-tl-[180px] rounded-br-[120px] w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Featured Recipe */}
        <section className="py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Recipe</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64"><Loading/></div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : topRecipes.length > 0 ? (
              <FeaturedRecipe recipe={topRecipes[0]} />
            ) : (
              <p className="text-center text-gray-500">No featured recipe available.</p>
            )}
          </div>
        </section>

        {/* Popular Recipes */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Popular Recipes</h2>
              <Button asChild variant="link" className="text-[#0C713D]">
                <Link to="/recipes">View All</Link>
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64"><Loading/></div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : topRecipes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No popular recipes available.</p>
            )}
          </div>
        </section>

        {/* Community Section */}
        <section className="py-12">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Share your recipes, vote on submissions, and help us build the most comprehensive collection of Sierra Leonean cuisine.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-[#0C713D] hover:bg-[#095e32]">
                <Link to="/auth/signup">Sign Up Now</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster richColors position="top-center" closeButton={true} />
    </div>
  );
};

export default Home;