import { useContext } from 'react';
import { RecipesContext } from '../RecipesContext';
import RecipeCard from '../RecipeCard';
import Voting from '../Voting';

const PendingRecipe = () => {
  const { recipes } = useContext(RecipesContext);

  const pendingRecipes = recipes.filter(recipe => {
    const votes = Array.isArray(recipe.votes) ? recipe.votes : [];

    const totalVotes = votes.length;
    const authenticVotes = votes.filter(vote => vote).length;

    return totalVotes < 3 || (authenticVotes / totalVotes) < 0.7;
  });

  return (
    <div className="p-4 py-28 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-neutral-200">Pending Recipes</h1>
      <div className="mt-12 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pendingRecipes.map(recipe => (
          <div key={recipe.id}>
            <RecipeCard recipe={recipe} />
            <Voting recipeId={recipe.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingRecipe;
