import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  return (
    <div className="max-w-full mx-auto mt-4 shadow-lg border rounded-md duration-300 hover:shadow-sm border-neutral-800 bg-gradient-to-bl from-neutral-800 via-neutral-900 to-neutral-950 flex flex-col justify-between">

      {/* Image */}
      <img
        src={recipe.image ? `${recipe.image}` : '/images/placeholder.jpg'}
        loading="lazy"
        alt={recipe.name}
        className="w-full h-48 rounded-t-md object-cover"
      />

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h2 className="text-lg font-semibold text-[#DA1212] line-clamp-1">{recipe.name}</h2>
        <p className="text-neutral-300 text-sm mt-3 line-clamp-3">{recipe.description}</p>
      </div>

      {/* Button */}
      <div className="flex justify-center p-4 mt-auto mb-4">
        <Link
          to={`/recipes/${recipe.id}`}
          className="bg-[#DA1212] text-white px-6 py-2 rounded hover:bg-[#DA1212] transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;