"use server"

export async function submitRecipe(formData: FormData) {
  // In a real app, this would save to a database

  // Simulate a delay for the submission process
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Process the form data
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const cookTime = Number.parseInt(formData.get("cookTime") as string)
  const servings = Number.parseInt(formData.get("servings") as string)
  const category = formData.get("category") as string
  const image = formData.get("image") as File

  // Parse the JSON strings back to arrays
  const ingredients = JSON.parse(formData.get("ingredients") as string)
  const instructions = JSON.parse(formData.get("instructions") as string)
  const tips = JSON.parse(formData.get("tips") as string).filter((tip: string) => tip.trim() !== "")

  console.log("Recipe submitted:", {
    name,
    description,
    cookTime,
    servings,
    category,
    imageFileName: image.name,
    ingredients,
    instructions,
    tips,
  })

  return { success: true }
}
