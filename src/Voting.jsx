import { useState, useEffect } from 'react';
import { db } from './server/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const Voting = ({ recipeId }) => {
  const [recipe, setRecipe] = useState(null);
  const [email, setEmail] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'recipes', recipeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Fetched recipe data:', data);
          const votes = data.votes ?? [];
          setRecipe({ ...data, votes });
          const storedEmail = localStorage.getItem(`voterEmail_${recipeId}`);
          if (storedEmail) {
            setEmail(storedEmail);
            setHasVoted(votes.some(vote => vote.email === storedEmail));
            setEmailSubmitted(true);
          }
        } else {
          setError('Recipe not found');
        }
      } catch (error) {
        setError('Error fetching recipe data');
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleVote = async (vote) => {
    if (!email.trim() || !isValidEmail(email)) {
      setError('Invalid email. Please submit a valid email first.');
      return;
    }
    if (hasVoted || !recipe) return;

    const voteData = { email: email.trim().toLowerCase(), vote };

    try {
      const docRef = doc(db, 'recipes', recipeId);
      console.log('Attempting to vote:', voteData);
      await updateDoc(docRef, {
        votes: arrayUnion(voteData),
      });
      console.log('Vote recorded in Firestore:', voteData);
      setRecipe(prev => {
        const newVotes = [...prev.votes, voteData];
        console.log('Updated local votes:', newVotes);
        return { ...prev, votes: newVotes };
      });
      localStorage.setItem(`voterEmail_${recipeId}`, email.trim().toLowerCase());
      setHasVoted(true);
    } catch (error) {
      if (error.code === 'permission-denied') {
        setError('Permission denied. Vote not recorded.');
      } else if (error.message.includes('array-union')) {
        setError('This email may have already voted.');
      } else {
        setError('Error voting');
      }
      console.error('Error voting:', error);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (recipe) {
      const emailLower = email.trim().toLowerCase();
      const alreadyVoted = recipe.votes.some(vote => vote.email === emailLower);
      setHasVoted(alreadyVoted);
      if (!alreadyVoted) {
        setEmailSubmitted(true);
      }
    }
  };

  if (loading) return <p className="text-neutral-200">Loading voting data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const totalVotes = recipe.votes ? recipe.votes.length : 0;
  const authenticVotes = recipe.votes ? recipe.votes.filter(vote => vote.vote).length : 0;
  const percentage = totalVotes > 0 ? ((authenticVotes / totalVotes) * 100).toFixed(1) : 0;

  return (
    <div className="mt-4">
      <p className="text-neutral-200 py-2">
        Authenticity: {percentage}% ({authenticVotes}/{totalVotes} votes)
      </p>
      {!hasVoted && !emailSubmitted ? (
        <div className="space-y-2 mt-2">
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white px-2 focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none"
            />
            <button
              type="submit"
              className="group inline-flex items-center gap-x-2 py-2 px-3 bg-[#DA1212] font-medium text-sm text-neutral-200 rounded-full focus:outline-none"
            >
              Submit
            </button>
          </form>
        </div>
      ) : !hasVoted && emailSubmitted ? (
        <div className="space-x-2 mt-2">
          <button
            onClick={() => handleVote(true)}
            className="bg-lime-700 text-white p-2 rounded hover:bg-lime-600"
          >
            Authentic
          </button>
          <button
            onClick={() => handleVote(false)}
            className="bg-red-700 text-white p-2 rounded hover:bg-red-600"
          >
            Not Authentic
          </button>
        </div>
      ) : (
        <p className="text-gray-500">You ({email}) have already voted.</p>
      )}
    </div>
  )
}
export default Voting;