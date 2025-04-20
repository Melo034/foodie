// Recipe data access functions
  import type { Recipe } from "./types"
  import { recipes } from "./data"
  
  export async function getAllRecipes(): Promise<Recipe[]> {
    // In a real app, this would fetch from a database
    return recipes
  }
  
  export async function getTopRecipes(count: number): Promise<Recipe[]> {
    // Sort by approval rating and return the top ones
    return [...recipes].sort((a, b) => b.approvalRating - a.approvalRating).slice(0, count)
  }
  
  export async function getRecipeById(id: string): Promise<Recipe> {
    const recipe = recipes.find((r) => r.id === id)
    if (!recipe) {
      throw new Error(`Recipe with ID ${id} not found`)
    }
    return recipe
  }
  
  export async function getSimilarRecipes(id: string, count: number): Promise<Recipe[]> {
    const recipe = await getRecipeById(id)
  
    // Find recipes with similar categories
    return recipes
      .filter((r) => r.id !== id && r.categories.some((cat) => recipe.categories.includes(cat)))
      .sort((a, b) => b.approvalRating - a.approvalRating)
      .slice(0, count)
  }
  