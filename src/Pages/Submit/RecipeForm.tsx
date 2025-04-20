import { useState } from "react";
import { Plus, Minus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { Ingredient, Recipe } from "@/lib/types";

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSubmit: (formData: FormData, ingredients: Ingredient[], instructions: string[], tips: string[], categories: string[]) => Promise<void>;
  mode: "add" | "edit";
}

const availableCategories = [
  "Main Dish",
  "Side Dish",
  "Dessert",
  "Drink",
  "Snack",
  "Sierra Leonean",
  "Vegetarian",
  "Gluten-Free",
];

const RecipeForm: React.FC<RecipeFormProps> = ({ initialData = {}, onSubmit, mode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData.ingredients?.length ? initialData.ingredients : [{ name: "", quantity: "" }]
  );
  const [instructions, setInstructions] = useState<string[]>(
    initialData.instructions?.length ? initialData.instructions : [""]
  );
  const [tips, setTips] = useState<string[]>(initialData.tips?.length ? initialData.tips : [""]);
  const [categories, setCategories] = useState<string[]>(initialData.categories || []);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: "name" | "quantity", value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addTip = () => {
    setTips([...tips, ""]);
  };

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...tips];
    newTips[index] = value;
    setTips(newTips);
  };

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validImageTypes.includes(file.type)) {
        toast.error("Error", { description: "Image must be JPEG, PNG, or WEBP." });
        e.target.value = "";
        setImagePreview(initialData.image || null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Error", { description: "Image must be less than 5MB." });
        e.target.value = "";
        setImagePreview(initialData.image || null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(initialData.image || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const cookTime = parseInt(formData.get("cookTime") as string) || 0;
    const servings = parseInt(formData.get("servings") as string) || 0;

    if (!name || name.length < 2) {
      toast.error("Error", { description: "Recipe name must be at least 2 characters long." });
      setIsSubmitting(false);
      return;
    }

    if (!description || description.length < 10) {
      toast.error("Error", { description: "Description must be at least 10 characters long." });
      setIsSubmitting(false);
      return;
    }

    if (cookTime <= 0) {
      toast.error("Error", { description: "Cooking time must be greater than 0 minutes." });
      setIsSubmitting(false);
      return;
    }

    if (servings <= 0) {
      toast.error("Error", { description: "Servings must be greater than 0." });
      setIsSubmitting(false);
      return;
    }

    if (categories.length === 0) {
      toast.error("Error", { description: "At least one category must be selected." });
      setIsSubmitting(false);
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.quantity.trim());
    if (validIngredients.length === 0) {
      toast.error("Error", { description: "At least one valid ingredient is required." });
      setIsSubmitting(false);
      return;
    }

    const validInstructions = instructions.filter((ins) => ins.trim());
    if (validInstructions.length === 0) {
      toast.error("Error", { description: "At least one valid instruction is required." });
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData, validIngredients, validInstructions, tips.filter((tip) => tip.trim()), categories);
    } catch (error) {
      console.error(`Error ${mode === "add" ? "submitting" : "updating"} recipe:`, error);
      toast.error("Error", {
        description: `Failed to ${mode === "add" ? "submit" : "update"} recipe. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Basic Information</h2>

        <div className="space-y-2">
          <Label htmlFor="name">Recipe Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData.name || ""}
            placeholder="e.g., Jollof Rice"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={initialData.description || ""}
            placeholder="Describe your recipe and its cultural significance"
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cookTime">Cooking Time (minutes)</Label>
            <Input
              id="cookTime"
              name="cookTime"
              type="number"
              min="1"
              defaultValue={initialData.cookTime || ""}
              placeholder="e.g., 45"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              name="servings"
              type="number"
              min="1"
              defaultValue={initialData.servings || ""}
              placeholder="e.g., 4"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Categories (select at least one)</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Recipe Image (Optional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 mb-2">Upload a photo of your dish</p>
            <p className="text-xs text-gray-400 mb-4">JPEG, PNG, or WEBP (max 5MB)</p>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
            >
              Choose File
            </Button>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Recipe preview"
                className="mt-4 mx-auto max-w-full h-48 object-cover rounded"
              />
            )}
          </div>
        </div>
      </div>

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
                  placeholder="e.g., 2 cups"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`ingredient-name-${index}`}>Ingredient</Label>
                <Input
                  id={`ingredient-name-${index}`}
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, "name", e.target.value)}
                  placeholder="e.g., Rice"
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

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-[#0C713D] hover:bg-[#095e32]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (mode === "add" ? "Submitting..." : "Updating...") : mode === "add" ? "Submit Recipe" : "Update Recipe"}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-4">
          By {mode === "add" ? "submitting" : "updating"}, you agree to our{" "}
          <a href="/community-guidelines" className="text-[#0C713D] hover:underline">
            community guidelines
          </a>{" "}
          and submission process.
        </p>
      </div>
    </form>
  );
};

export default RecipeForm;