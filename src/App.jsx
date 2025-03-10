import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecipesProvider from './RecipesProvider';
import Home from './Pages/Home';
import PendingRecipe from './Pages/PendingRecipe';
import Recipe from './Pages/Recipe';
import RecipeDetails from './Pages/RecipeDetails';
import Submission from './Pages/Submission';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';

function App() {
  return (
    <RecipesProvider>
      <Router>
        <div className="min-h-screen bg-neutral-950">
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<Recipe />} />
            <Route path="/recipes/:id" element={<RecipeDetails />} />
            <Route path="/submit" element={<Submission />} />
            <Route path="/pending" element={<PendingRecipe />} />
          </Routes>
          <Footer/>
        </div>
      </Router>
    </RecipesProvider>
  );
}

export default App;
