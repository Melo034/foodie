import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { RecipesContext } from '../RecipesContext';
import Voting from '../Voting';


const RecipeDetails = () => {
  const { id } = useParams();
  const { recipes } = useContext(RecipesContext);
  const recipe = recipes.find(r => r.id === parseInt(id));

  if (!recipe) return <div className="p-4">Recipe not found.</div>;

  const totalVotes = recipe.votes.length;
  const authenticVotes = recipe.votes.filter(vote => vote).length;
  const isApproved = totalVotes >= 3 && (authenticVotes / totalVotes) >= 0.7;

  return (
    <div className="bg-neutral-900 p-6 rounded-lg ">
      {/*hero section*/}
      <div className="max-w-screen-xl mx-auto text-gray-600 gap-x-12 items-center justify-between overflow-hidden md:flex md:px-8">
        <div className="flex-none space-y-5 px-4 sm:max-w-lg md:px-0 lg:max-w-xl">
          <h2 className="text-4xl text-neutral-200 font-extrabold md:text-5xl">
            {recipe.name}
          </h2>
          <p className="text-neutral-300">
            {recipe.description}
          </p>
          <div className="flex justify-center md:justify-start">
            <Link
              to={`/edit/${id}`}
              className="inline-flex items-center justify-center sm:py-3 sm:px-9 py-2 px-4 text-xl font-semibold text-white transition duration-300 border-2 rounded-full border-[#DA1212] hover:bg-[#DA1212] hover:-translate-y-1 hover:scale-95"
            >
              Edit Startup
            </Link>
          </div>
        </div>
        <div className="flex-none mt-14 md:mt-0 md:max-w-xl">
          <img
            src={recipe.image ? `${recipe.image}` : '/images/placeholder.jpg'}
            loading="lazy"
            alt={recipe.name}
            className="rounded-tl-[108px] rounded-br-[108px]"
          />
        </div>
      </div>
      {/*hero section*/}
      <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8 py-28 flex flex-col md:flex-row justify-between">
        {/* Preparation Section */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-xl font-semibold mt-4 text-center text-[#DA1212]">Ingredients</h2>
          <ul className="pl-5 mt-2 text-center">
            {recipe.ingredients.map((ing, idx) =>
              <li key={idx} className="text-neutral-300 text-xs sm:text-lg md:text-xl">{ing}</li>
            )}
          </ul>
        </div>
        {/* Preparation Section */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-xl font-semibold mt-4 text-center text-[#DA1212]">Preparation</h2>
          <ul className="pl-5 mt-2 text-center">
            {recipe.preparation.split('\n').map((step, idx) =>
              <li key={idx} className="text-neutral-300 text-xs sm:text-lg md:text-xl">{step}</li>
            )}
            {!isApproved && <Voting recipe={recipe} />}
          </ul>
        </div>


      </div>
    </div>
  );
};

export default RecipeDetails