import { Link } from "react-router-dom"
import { Clock, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Recipe } from "@/lib/types"

interface RecipeCardProps {
  recipe: Pick<Recipe, "id" | "name" | "image" | "cookTime" | "servings" | "approvalRating" | "categories" | "author">
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md">
      <Link to={`/recipes/${recipe.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          {recipe.approvalRating >= 70 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-[#0C713D]">Verified</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-[#0C713D] transition-colors">{recipe.name}</h3>
          <p className="text-sm text-gray-500 mb-3">By {recipe.author.name}</p>

          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookTime} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Community Rating</span>
              <span className="font-medium">{recipe.approvalRating}%</span>
            </div>
            <Progress value={recipe.approvalRating} className="h-1" />
          </div>

          <div className="flex flex-wrap gap-1">
            {recipe.categories.slice(0, 3).map((category) => (
              <span key={category} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {category}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  )
}