import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../server/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import Voting from '../Voting';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRecipe(docSnap.data());
        } else {
          console.error('Recipe not found');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <div className="p-4">Loading recipe...</div>;
  if (!recipe) return <div className="p-4">Recipe not found.</div>;

  // Ensure votes is an array before checking
  const votes = Array.isArray(recipe.votes) ? recipe.votes : [];
  const totalVotes = votes.length;
  const authenticVotes = votes.filter(vote => vote).length;
  const isApproved = totalVotes >= 3 && (authenticVotes / totalVotes) >= 0.7;

  return (
    <div className="bg-neutral-900 p-6 rounded-lg py-28">
      {/* Hero section */}
      <div className="max-w-screen-xl mx-auto text-gray-600 gap-x-12 items-center justify-between overflow-hidden md:flex md:px-8">
        <div className="flex-none space-y-5 px-4 sm:max-w-lg md:px-0 lg:max-w-xl">
          <h2 className="text-4xl text-neutral-200 font-extrabold md:text-5xl">
            {recipe.name}
          </h2>
          <p className="text-neutral-300">{recipe.description}</p>
        </div>
        <div className="flex-none mt-14 md:mt-0 md:max-w-xl">
          <img
            src={recipe.image || '/images/placeholder.jpg'}
            loading="lazy"
            alt={recipe.name}
            className="rounded-tl-[108px] rounded-br-[108px]"
          />
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8 py-28 flex flex-col md:flex-row justify-between">
        {/* Ingredients Section */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-xl font-semibold mt-4 text-center text-[#DA1212]">Ingredients</h2>
          <ul className="pl-5 mt-2 text-center">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="text-neutral-300 text-xs sm:text-lg md:text-xl">{ing}</li>
            ))}
          </ul>
        </div>

        {/* Preparation Section */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-xl font-semibold mt-4 text-center text-[#DA1212]">Preparation</h2>
          <ul className="pl-5 mt-2 text-center">
            {recipe.preparation.split('\n').map((step, idx) => (
              <li key={idx} className="text-neutral-300 text-xs sm:text-lg md:text-xl">{step}</li>
            ))}
          </ul>
          {!isApproved && <Voting recipeId={id} />}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
