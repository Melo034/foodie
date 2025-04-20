import { Link } from "react-router-dom"
import { Clock, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Recipe } from "@/lib/types"

interface FeaturedRecipeProps {
  recipe: Pick<Recipe, "id" | "name" | "image" | "description" | "cookTime" | "servings" | "approvalRating" | "author">
}

export function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  if (!recipe || !recipe.author) return null

  return (
    <div className="grid md:grid-cols-2 gap-8 bg-gray-50 rounded-xl overflow-hidden">
      <div className="relative h-[300px] md:h-auto">
        <img src={recipe.image ?? "/placeholder.svg"} alt={recipe.name} className="object-cover w-full h-full" />
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
              src={recipe.author.avatar ?? "/placeholder.svg"}
              alt={recipe.author.name}
              className="object-cover"
            />
          </div>
          <span className="text-sm text-gray-600">By {recipe.author.name}</span>
        </div>

        <p className="text-gray-700 mb-6 line-clamp-3">{recipe.description}</p>

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
          <Link to={`/recipes/${recipe.id}`}>
            <Button className="bg-[#0C713D] hover:bg-[#095e32] flex gap-2">
              View Recipe
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
