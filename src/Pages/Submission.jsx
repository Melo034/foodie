import { useState, useContext } from 'react';
import { RecipesContext } from '../RecipesContext';
import { useNavigate } from 'react-router-dom';

const Submission = () => {
  const { addRecipe } = useContext(RecipesContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [preparation, setPreparation] = useState('');
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecipe = {
      name,
      description,
      ingredients: ingredients.split('\n').map(item => item.trim()).filter(item => item),
      preparation,
      image: image || '/images/placeholder.jpg',
      votes: [],
    };
    addRecipe(newRecipe);
    navigate('/pending');
  };

  return (
    <div className="max-w-lg mx-auto p-4 py-28">
      <h1 className="text-2xl font-bold text-neutral-200 mb-4">Submit a Recipe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Recipe Name' name="name" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 autofill:pt-6  autofill:pb-2" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 autofill:pt-6  autofill:pb-2" required />
        <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Ingredients (one per line)" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 autofill:pt-6  autofill:pb-2" required />
        <textarea value={preparation} onChange={(e) => setPreparation(e.target.value)} placeholder="Preparation Steps" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 autofill:pt-6  autofill:pb-2" required />
        <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL (optional)" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 autofill:pt-6  autofill:pb-2" />
        <p className="mt-5 flex gap-5">
          <button type="submit" className="group inline-flex items-center gap-x-2 py-2 px-3 bg-[#DA1212] font-medium text-sm text-neutral-200 rounded-full focus:outline-none">
            Submit Recipe
            <svg className="flex-shrink-0 size-4 transition group-hover:translate-x-0.5 group-focus:translate-x-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          <button type="button"  className="group inline-flex items-center gap-x-2 py-2 px-3 bg-neutral-900 font-medium text-sm text-neutral-200 rounded-full focus:outline-none">
            Cancel
          </button>
        </p>
      </form>
    </div>
  );
};

export default Submission;
