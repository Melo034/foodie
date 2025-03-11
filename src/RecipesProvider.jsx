import { useEffect, useState } from "react";
import { db, collection, getDocs, addDoc, updateDoc, doc } from "./server/firebase";
import { RecipesContext } from "./RecipesContext";


export const RecipesProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

  // Fetch recipes from Firestore
  useEffect(() => {
    const fetchRecipes = async () => {
      const recipesCollection = collection(db, "recipes");
      const recipeSnapshot = await getDocs(recipesCollection);
      const recipeList = recipeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(recipeList);
    };

    fetchRecipes();
  }, []);

  // Add new recipe to Firestore
  const addRecipe = async (recipe) => {
    const docRef = await addDoc(collection(db, "recipes"), recipe);
    setRecipes([...recipes, { id: docRef.id, ...recipe }]);
  };

  // Update existing recipe in Firestore
  const updateRecipe = async (id, updatedData) => {
    const recipeRef = doc(db, "recipes", id);
    await updateDoc(recipeRef, updatedData);
    setRecipes(recipes.map(recipe => (recipe.id === id ? { ...recipe, ...updatedData } : recipe)));
  };

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe, updateRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
};
