// utils/firestore.ts
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { Timestamp } from "firebase/firestore"; // Import Timestamp type
import { Recipe, Comment } from "@/lib/types";

export const normalizeRecipe = (doc: QueryDocumentSnapshot<DocumentData>): Recipe => {
  const data = doc.data();
  if (!data) throw new Error("Invalid recipe data");

  // Helper function to normalize dates
  const normalizeDate = (value: unknown): string => {
    if (typeof value === "string") {
      // Validate if the string is a valid date
      return isNaN(Date.parse(value)) ? new Date().toISOString() : value;
    }
    if (value instanceof Timestamp) {
      return value.toDate().toISOString();
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Fallback for invalid or unexpected types
    return new Date().toISOString();
  };

  return {
    id: doc.id,
    name: data.name || "Untitled Recipe",
    description: data.description || "",
    image: data.image ?? null, // Use null instead of undefined
    cookTime: data.cookTime || 0,
    servings: data.servings || 1,
    categories: Array.isArray(data.categories) ? data.categories : [],
    createdAt: normalizeDate(data.createdAt),
    approvalRating: data.approvalRating || 0,
    voteCount: data.voteCount || (Array.isArray(data.votes) ? data.votes.length : 0),
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    instructions: Array.isArray(data.instructions) ? data.instructions : [],
    tips: Array.isArray(data.tips) ? data.tips : [],
    author: data.author && data.author.id && data.author.name
      ? {
          id: data.author.id,
          name: data.author.name,
          avatar: data.author.avatar ?? null, // Use null instead of undefined
          bio: data.author.bio ?? null,
          recipesCount: data.author.recipesCount || 0,
        }
      : { id: "unknown", name: "Anonymous User", recipesCount: 0 },
    comments: Array.isArray(data.comments)
      ? data.comments.map((comment: Comment) => ({
          id: comment.id,
          author: comment.author,
          content: comment.content,
          date: normalizeDate(comment.date),
        }))
      : [],
    status: data.status || "published",
    votes: Array.isArray(data.votes)
      ? data.votes
      : Array.isArray(data.voters)
        ? data.voters.map((userId: string) => ({ userId, type: "up" }))
        : [],
  };
};


export const cleanFirestoreData = <T>(data: T): T => {
    if (Array.isArray(data)) {
      return data.map((item: unknown) =>
        item && typeof item === "object" ? cleanFirestoreData(item) : item
      ) as T;
    }
  
    if (data && typeof data === "object") {
      const cleaned: Record<string, unknown> = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = (data as Record<string, unknown>)[key];
          if (value === undefined) {
            cleaned[key] = null;
          } else if (value && typeof value === "object" && !Array.isArray(value)) {
            cleaned[key] = cleanFirestoreData(value);
          } else if (Array.isArray(value)) {
            cleaned[key] = value.map((item: unknown) =>
              item && typeof item === "object" ? cleanFirestoreData(item) : item
            );
          } else {
            cleaned[key] = value;
          }
        }
      }
      return cleaned as T;
    }
    return data;
  };