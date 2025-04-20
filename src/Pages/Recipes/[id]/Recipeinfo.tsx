import { Link, useParams } from "react-router-dom"
import { Clock, Users, ThumbsUp, MessageSquare, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getRecipeById, getSimilarRecipes } from "@/lib/recipes"
import { Recipe } from "@/lib/types"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"

const Recipeinfo = () => {
  const { id } = useParams<{ id: string }>()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const recipeData = await getRecipeById(id)
        const similar = await getSimilarRecipes(id, 3)
        setRecipe(recipeData)
        setSimilarRecipes(similar)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error loading recipe:", err.message)
          setError(err.message)
        } else {
          console.error("Unexpected error", err)
          setError("An unexpected error occurred.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) return <p>Loading recipe...</p>
  if (error) return <p>{error}</p>
  if (!recipe) return <p>No recipe found.</p>

  return (
    <>
      <Navbar />
      <div className="container px-4 py-24 mx-auto max-w-7xl sm:py-40">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Header */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={recipe.author.avatar || "/placeholder.svg"} alt={recipe.author.name} />
                    <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">By {recipe.author.name}</span>
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
                <img src={recipe.image || "/placeholder.svg"} alt={recipe.name} className="object-cover w-full h-full" />
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About This Dish</h2>
                <p className="text-gray-700">{recipe.description}</p>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
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
              </div>

              {/* Instructions */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Instructions</h2>
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
                <Button className="flex gap-2 bg-[#0C713D] hover:bg-[#095e32]">
                  <ThumbsUp className="h-4 w-4" />
                  Vote (Approve)
                </Button>
                <Button variant="outline" className="flex gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Add Comment
                </Button>
                <Button variant="outline" className="flex gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              {/* Comments */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Comments ({recipe.comments.length})</h2>
                <div className="space-y-6">
                  {recipe.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{comment.author.name}</div>
                          <div className="text-xs text-gray-500">{comment.date}</div>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Author */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">About the Author</h3>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={recipe.author.avatar || "/placeholder.svg"} alt={recipe.author.name} />
                  <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{recipe.author.name}</div>
                  <div className="text-sm text-gray-500">{recipe.author.recipesCount} recipes</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-4">{recipe.author.bio}</p>
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </div>

            {/* Similar Recipes */}
            <div>
              <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
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
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-bold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.categories.map((category) => (
                  <Link key={category} to={`/recipes?category=${category}`}>
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-[#0C713D] hover:text-white transition-colors">
                      {category}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Recipeinfo