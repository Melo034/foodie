import { useContext } from 'react';
import { RecipesContext } from './RecipesContext';

const Voting = ({recipe}) => {
    const { voteRecipe, votedRecipeIds } = useContext(RecipesContext);
    const hasVoted = votedRecipeIds.includes(recipe.id);
    const totalVotes = recipe.votes.length;
    const authenticVotes = recipe.votes.filter(vote => vote).length;
    const percentage = totalVotes > 0 ? (authenticVotes / totalVotes * 100).toFixed(1) : 0;
  
    return (
      <div className="mt-4">
        <p>Authenticity: {percentage}% ({authenticVotes}/{totalVotes} votes)</p>
        {!hasVoted && (
          <div className="space-x-2 mt-2">
            <button onClick={() => voteRecipe(recipe.id, true)} className="bg-green-500 text-white p-2 rounded">Authentic</button>
            <button onClick={() => voteRecipe(recipe.id, false)} className="bg-red-500 text-white p-2 rounded">Not Authentic</button>
          </div>
        )}
        {hasVoted && <p className="text-gray-500">You’ve already voted.</p>}
      </div>
    );
  };

export default Voting