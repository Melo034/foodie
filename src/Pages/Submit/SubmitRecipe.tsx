import type React from "react"
import { useState } from "react"
import { Plus, Minus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitRecipe } from "@/lib/actions"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"


const SubmitRecipe = () => {
    const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }])
    const [instructions, setInstructions] = useState([""])
    const [tips, setTips] = useState([""])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
  
    const addIngredient = () => {
      setIngredients([...ingredients, { name: "", quantity: "" }])
    }
  
    const removeIngredient = (index: number) => {
      const newIngredients = [...ingredients]
      newIngredients.splice(index, 1)
      setIngredients(newIngredients)
    }
  
    const updateIngredient = (index: number, field: "name" | "quantity", value: string) => {
      const newIngredients = [...ingredients]
      newIngredients[index][field] = value
      setIngredients(newIngredients)
    }
  
    const addInstruction = () => {
      setInstructions([...instructions, ""])
    }
  
    const removeInstruction = (index: number) => {
      const newInstructions = [...instructions]
      newInstructions.splice(index, 1)
      setInstructions(newInstructions)
    }
  
    const updateInstruction = (index: number, value: string) => {
      const newInstructions = [...instructions]
      newInstructions[index] = value
      setInstructions(newInstructions)
    }
  
    const addTip = () => {
      setTips([...tips, ""])
    }
  
    const removeTip = (index: number) => {
      const newTips = [...tips]
      newTips.splice(index, 1)
      setTips(newTips)
    }
  
    const updateTip = (index: number, value: string) => {
      const newTips = [...tips]
      newTips[index] = value
      setTips(newTips)
    }
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
  
      const formData = new FormData(e.target as HTMLFormElement)
  
      // Add the arrays that aren't naturally captured by FormData
      formData.append("ingredients", JSON.stringify(ingredients))
      formData.append("instructions", JSON.stringify(instructions))
      formData.append("tips", JSON.stringify(tips))
  
      try {
        const response = await submitRecipe(formData)
        if (!response.success) {
          navigate("/submission-success")
        }
      } catch (error) {
        console.error("Error submitting recipe:", error)
        setIsSubmitting(false)
      }
    }
  
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-20 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Submit a Recipe</h1>
          <p className="text-gray-600 mb-8">
            Share your favorite Sierra Leonean recipe with our community. Recipes with 70% or higher approval rating will
            be added to our main collection.
          </p>
  
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Basic Information</h2>
  
              <div className="space-y-2">
                <Label htmlFor="name">Recipe Name</Label>
                <Input id="name" name="name" placeholder="Enter the name of your recipe" required />
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your recipe and its origins"
                  className="min-h-[100px]"
                  required
                />
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cooking Time (minutes)</Label>
                  <Input id="cookTime" name="cookTime" type="number" min="1" placeholder="e.g. 45" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input id="servings" name="servings" type="number" min="1" placeholder="e.g. 4" required />
                </div>
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Dish</SelectItem>
                    <SelectItem value="side">Side Dish</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="drink">Drink</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="image">Recipe Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-2">Upload a photo of your dish</p>
                  <p className="text-xs text-gray-400 mb-4">PNG, JPG or WEBP (max. 5MB)</p>
                  <Input id="image" name="image" type="file" accept="image/*" className="hidden" required />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
  
            {/* Ingredients */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Ingredients</h2>
  
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor={`ingredient-quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`ingredient-quantity-${index}`}
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        placeholder="e.g. 2 cups"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ingredient-name-${index}`}>Ingredient</Label>
                      <Input
                        id={`ingredient-name-${index}`}
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        placeholder="e.g. Rice"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mt-8"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
  
              <Button type="button" variant="outline" className="flex gap-2" onClick={addIngredient}>
                <Plus className="h-4 w-4" />
                Add Ingredient
              </Button>
            </div>
  
            {/* Instructions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Instructions</h2>
  
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0C713D] text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}: Describe what to do`}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={instructions.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
  
              <Button type="button" variant="outline" className="flex gap-2" onClick={addInstruction}>
                <Plus className="h-4 w-4" />
                Add Step
              </Button>
            </div>
  
            {/* Tips */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Tips (Optional)</h2>
  
              {tips.map((tip, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Input
                      value={tip}
                      onChange={(e) => updateTip(index, e.target.value)}
                      placeholder="Add a helpful tip for this recipe"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeTip(index)}
                    disabled={tips.length === 1 && !tips[0]}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
  
              <Button type="button" variant="outline" className="flex gap-2" onClick={addTip}>
                <Plus className="h-4 w-4" />
                Add Tip
              </Button>
            </div>
  
            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" className="w-full bg-[#0C713D] hover:bg-[#095e32]" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Recipe"}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                By submitting, you agree to our community guidelines and submission process.
              </p>
            </div>
          </form>
        </div>
        </div>
        <Footer/>
      </>
    )
  }
  
export default SubmitRecipe