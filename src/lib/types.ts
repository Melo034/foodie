// All types for the Sierra Leone Recipes website

export interface Ingredient {
    name: string
    quantity: string
  }
  
  export interface Author {
    name: string
    avatar: string
    bio?: string
    recipesCount?: number
  }
  
  export interface Comment {
    id: string
    author: Author
    content: string
    date: string
  }
  
  export interface Recipe {
    id: string
    name: string
    description: string
    image: string
    cookTime: number
    servings: number
    approvalRating: number
    votes: number
    ingredients: Ingredient[]
    instructions: string[]
    tips?: string[]
    categories: string[]
    author: Author
    comments: Comment[]
  }
  