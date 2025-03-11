import { useState, useEffect } from 'react';
import { db } from './server/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const Voting = ({ recipeId }) => {
  const [recipe, setRecipe] = useState(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "recipes", recipeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const votes = data.votes ?? [];
          setRecipe({ ...data, votes });
          // Check local storage to see if this browser voted
          const hasVoted = localStorage.getItem(`voted_${recipeId}`);
          setVoted(!!hasVoted);
        } else {
          setError("Recipe not found");
        }
      } catch (error) {
        setError("Error fetching recipe data");
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId]);

  const handleVote = async (vote) => {
    if (voted || !recipe) return;

    try {
      const docRef = doc(db, 'recipes', recipeId);
      await updateDoc(docRef, {
        votes: arrayUnion(vote),
      });
      setRecipe(prev => ({
        ...prev,
        votes: [...prev.votes, vote],
      }));
      // Mark this browser as having voted
      localStorage.setItem(`voted_${recipeId}`, 'true');
      setVoted(true);
    } catch (error) {
      setError('Error voting');
      console.error('Error voting:', error);
    }
  };
  if (loading) return <p>Loading voting data...</p>;
  if (error) return <p>{error}</p>;

  const totalVotes = recipe.votes ? recipe.votes.length : 0;
  const authenticVotes = recipe.votes ? recipe.votes.filter(vote => vote).length : 0;
  const percentage = totalVotes > 0 ? ((authenticVotes / totalVotes) * 100).toFixed(1) : 0;

  return (
    <div className="mt-4">
      <p className='text-neutral-200 py-2'>Authenticity: {percentage}% ({authenticVotes}/{totalVotes} votes)</p>
      {!voted ? (
        <div className="space-x-2 mt-2">
          <button onClick={() => handleVote(true)} className="bg-lime-700 text-white p-2  rounded">Authentic</button>
          <button onClick={() => handleVote(false)} className="bg-red-700 text-white p-2 rounded">Not Authentic</button>
        </div>
      ) : (
        <p className="text-gray-500">You've already voted.</p>
      )}
    </div>
  );
};

export default Voting;
