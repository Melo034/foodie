import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../server/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../server/firebase'; 

const Submission = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get recipe ID from URL if editing
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [preparation, setPreparation] = useState('');
  const [image, setImage] = useState('');

  // Load recipe data if updating
  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setDescription(data.description);
          setIngredients(data.ingredients.join('\n')); 
          setPreparation(data.preparation);
          setImage(data.image);
        } else {
          console.error('Recipe not found');
        }
      };
      fetchRecipe();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let imageUrl = image || '/images/placeholder.jpg';
  
    if (image && typeof image !== 'string') {
      const imageRef = ref(storage, `recipes/${Date.now()}-${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);
  
      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error), 
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref); 
              resolve();
            }
          );
        });
      } catch (error) {
        console.error('Image upload failed:', error);
        return; 
      }
    }
  
    const recipeData = {
      name,
      description,
      ingredients: ingredients.split('\n').map((item) => item.trim()).filter((item) => item),
      preparation,
      image: imageUrl,
      votes: [], 
      createdAt: serverTimestamp(),
    };
  
    try {
      if (id) {
        const docRef = doc(db, 'recipes', id);
        await updateDoc(docRef, recipeData);
      } else {
        await addDoc(collection(db, 'recipes'), recipeData);
      }
      navigate('/pending'); 
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-4 py-28">
      <h1 className="text-2xl font-bold text-neutral-200 mb-4">Submit a Recipe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Recipe Name' name="name" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none" required />
        <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Ingredients (one per line)" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none" required />
        <textarea value={preparation} onChange={(e) => setPreparation(e.target.value)} placeholder="Preparation Steps" className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white  focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none" required />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])} 
          placeholder="Image (optional)"
          className="peer p-4 block w-full bg-neutral-800 border-transparent rounded-lg text-sm text-white focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 autofill:pt-6 autofill:pb-2"
        />
        <p className="mt-5 flex gap-5">
          <button type="submit" className="group inline-flex items-center gap-x-2 py-2 px-3 bg-[#DA1212] font-medium text-sm text-neutral-200 rounded-full focus:outline-none">
            {id ? 'Update' : 'Submit'} Recipe
            <svg className="flex-shrink-0 size-4 transition group-hover:translate-x-0.5 group-focus:translate-x-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          <button type="button" onClick={() => navigate(id ? `/recipe/${id}` : '/')} className="group inline-flex items-center gap-x-2 py-2 px-3 bg-neutral-900 font-medium text-sm text-neutral-200 rounded-full focus:outline-none">
            Cancel
          </button>
        </p>
      </form>
    </div>
  );
};

export default Submission;
