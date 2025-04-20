
// Represents an ingredient in a recipe
export interface Ingredient {
  name: string; 
  quantity: string; 
}

// Represents a user who created an account and can submit recipes
export interface User {
  id: string;
  name: string; 
  email: string; 
  avatar?: string;
  bio?: string; 
  recipesCount: number;
  joinedAt: string;
}

// Represents the author of a recipe (subset of User for recipe context)
export interface Author {
  id: string; 
  name: string; 
  avatar?: string; 
  bio?: string; 
  recipesCount: number; 
}

// Represents a comment on a recipe for community interaction
export interface Comment {
  id: string;
  author: { id: string; name: string; avatar?: string };
  content: string;
  date: string;
}

// Represents a recipe submitted by a user
export interface Recipe {
  id: string;
  name: string;
  description: string;
  image?: string;
  cookTime: number;
  servings: number;
  categories: string[];
  createdAt: string;
  approvalRating: number;
  votes: number;
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string[];
  author: Author;
  comments?: Comment[];
  status?: "draft" | "pending" | "published";
  voters?: string[];
}