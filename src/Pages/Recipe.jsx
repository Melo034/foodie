import { useContext, useState } from 'react';
import { RecipesContext } from '../RecipesContext';
import RecipeCard from '../RecipeCard';

const Recipe = () => {
    const { recipes } = useContext(RecipesContext);
    const [searchTerm, setSearchTerm] = useState('');
  
    const approvedRecipes = recipes.filter(recipe => {
      const totalVotes = recipe.votes.length;
      const authenticVotes = recipe.votes.filter(vote => vote).length;
      return totalVotes >= 3 && (authenticVotes / totalVotes) >= 0.7;
    });
  
    const filteredRecipes = approvedRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Approved Recipes</h1>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search recipes..."
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      </div>
    );
  };

export default Recipe