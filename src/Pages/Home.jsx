import { useContext, useState } from 'react';
import { RecipesContext } from '../RecipesContext';
import RecipeCard from '../RecipeCard';
import Hero from '../Components/Hero';

const Home = () => {
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
    <div>
      <Hero/>
    <section className="py-28 mx-auto px-4 max-w-screen-xl md:px-8">
      <div className="text-center">
        <h1 className="text-3xl text-neutral-200 font-semibold">
          Recipes
        </h1>
        <p className="mt-3 text-neutral-500">
          Recipes that are loved by the community. Updated every hour.
        </p>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search recipes..."
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
      </div>
    </section >
    </div>
  );
};

export default Home