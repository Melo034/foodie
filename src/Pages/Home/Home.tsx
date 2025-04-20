import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import hero from "../../assets/Hero.jpg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecipeCard } from "@/components/recipe-card"
import { FeaturedRecipe } from "@/components/featured-recipe"
import { getTopRecipes } from "@/lib/recipes"
import { Recipe } from "@/lib/types"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"
import { useEffect, useState } from "react"


const Home = () => {
    const [topRecipes, setTopRecipes] = useState<Recipe[]>([])

    useEffect(() => {
        const fetchRecipes = async () => {
            const recipes = await getTopRecipes(3)
            setTopRecipes(recipes)
        }

        fetchRecipes()
    }, [])

    const featuredRecipe = topRecipes[0]


    return (
        <div>
            <Navbar />
            <main className="">
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
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search for recipes or ingredients..."
                                    className="pl-10 py-6 rounded-full"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Link to="/recipes">
                                    <Button className="bg-[#0C713D] hover:bg-[#095e32]">Browse Recipes</Button>
                                </Link>
                                <Link to="/submit-recipe">
                                    <Button variant="outline">Submit a Recipe</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-xl overflow-hidden">
                            <img src={hero} alt="Sierra Leonean Food" className="object-cover rounded-tl-[180px] rounded-br-[120px] w-full h-full" />
                        </div>
                    </div>
                </section>

                {/* Featured Recipe */}
                <section className="py-12">
                    <div className="container mx-auto max-w-6xl px-4">
                        <h2 className="text-3xl font-bold mb-8">Featured Recipe</h2>
                        <FeaturedRecipe recipe={featuredRecipe} />
                    </div>
                </section>

                {/* Popular Recipes */}
                <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold">Popular Recipes</h2>
                            <Link to="/recipes">
                                <Button variant="link" className="text-[#0C713D]">
                                    View All
                                </Button>
                            </Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {topRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Community Section */}
                <section className="py-12">
                    <div className="container max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            Share your recipes, vote on submissions, and help us build the most comprehensive collection of Sierra
                            Leonean cuisine.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/signup">
                                <Button className="bg-[#0C713D] hover:bg-[#095e32]">Sign Up Now</Button>
                            </Link>
                            <Link to="/about">
                                <Button variant="outline">Learn More</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Home