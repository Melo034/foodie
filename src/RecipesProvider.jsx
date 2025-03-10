import { useState, useEffect } from 'react';
import { RecipesContext } from './RecipesContext';


const RecipesProvider = ({children}) => {
    const [recipes, setRecipes] = useState(() => {
        const saved = localStorage.getItem('recipes');
        return saved ? JSON.parse(saved) : initialRecipes;
      });
      const [votedRecipeIds, setVotedRecipeIds] = useState(() => {
        const saved = localStorage.getItem('votedRecipeIds');
        return saved ? JSON.parse(saved) : [];
      });
    
      useEffect(() => {
        localStorage.setItem('recipes', JSON.stringify(recipes));
      }, [recipes]);
    
      useEffect(() => {
        localStorage.setItem('votedRecipeIds', JSON.stringify(votedRecipeIds));
      }, [votedRecipeIds]);
    
      const addRecipe = (newRecipe) => {
        const maxId = Math.max(...recipes.map(r => r.id), 0);
        newRecipe.id = maxId + 1;
        setRecipes([...recipes, newRecipe]);
      };
    
      const voteRecipe = (recipeId, isAuthentic) => {
        if (votedRecipeIds.includes(recipeId)) {
          alert("You have already voted on this recipe.");
          return;
        }
        setRecipes(recipes.map(recipe =>
          recipe.id === recipeId ? { ...recipe, votes: [...recipe.votes, isAuthentic] } : recipe
        ));
        setVotedRecipeIds([...votedRecipeIds, recipeId]);
      };
    
      return (
        <RecipesContext.Provider value={{ recipes, addRecipe, voteRecipe, votedRecipeIds }}>
          {children}
        </RecipesContext.Provider>
      );
    };
    
    // Initial Recipes
    const initialRecipes = [
      { id: 1, name: "Jollof Rice", description: "A spiced rice dish.", ingredients: ["Rice", "Tomatoes", "Onions", "Pepper"], preparation: "Cook rice.\nMake sauce.\nMix.", image: "", votes: [true, true, true, false, true] },
      { id: 2, name: "Cassava Leaves", description: "A leafy stew.", ingredients: ["Cassava leaves", "Palm oil", "Fish"], preparation: "Boil leaves.\nAdd oil and fish.\nSimmer.", image: "", votes: [true, true, true] },
      { id: 3, name: "Pepper Soup", description: "A spicy broth.", ingredients: ["Chicken", "Pepper", "Spices"], preparation: "Boil chicken.\nAdd spices.\nServe hot.", image: "", votes: [true, true, false, true] },
      { id: 4, name: "Fried Plantains", description: "Sweet fried slices.", ingredients: ["Plantains", "Oil"], preparation: "Slice plantains.\nFry in oil.", image: "", votes: [true, true, true, true] },
      { id: 5, name: "Groundnut Soup", description: "Peanut-based stew.", ingredients: ["Peanuts", "Chicken", "Vegetables"], preparation: "Grind peanuts.\nCook with chicken.", image: "", votes: [true, true, true] },
      { id: 6, name: "Okra Soup", description: "A slimy delight.", ingredients: ["Okra", "Fish", "Palm oil"], preparation: "Chop okra.\nCook with fish.", image: "", votes: [true, false, true, true] },
      { id: 7, name: "Bean Akara", description: "Fried bean cakes.", ingredients: ["Beans", "Onions", "Oil"], preparation: "Blend beans.\nFry batter.", image: "", votes: [true, true, true] },
      { id: 8, name: "Coconut Rice", description: "Rice with coconut.", ingredients: ["Rice", "Coconut milk"], preparation: "Cook rice in coconut milk.", image: "", votes: [true, true, false, true] },
      { id: 9, name: "Ginger Beer", description: "Spicy drink.", ingredients: ["Ginger", "Sugar", "Water"], preparation: "Grate ginger.\nMix with sugar.", image: "", votes: [true, true, true] },
      { id: 10, name: "Puff Puff", description: "Sweet doughnuts.", ingredients: ["Flour", "Sugar", "Yeast"], preparation: "Mix dough.\nFry balls.", image: "", votes: [true, true, true, false] },
    ];

export default RecipesProvider