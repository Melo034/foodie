import { useContext } from 'react';
import { RecipesContext } from '../RecipesContext';
import RecipeCard from '../RecipeCard';
import Voting from '../Voting';

const PendingRecipe = () => {
    const { recipes } = useContext(RecipesContext);

    const pendingRecipes = recipes.filter(recipe => {
      const totalVotes = recipe.votes.length;
      const authenticVotes = recipe.votes.filter(vote => vote).length;
      return totalVotes < 3 || (authenticVotes / totalVotes) < 0.7;
    });
  
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Pending Recipes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRecipes.map(recipe => (
            <div key={recipe.id}>
              <RecipeCard recipe={recipe} />
              <Voting recipe={recipe} />
            </div>
          ))}
        </div>
      </div>
    );
  };

export default PendingRecipe