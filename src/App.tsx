import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import SubmitRecipe from "./Pages/Submit/SubmitRecipe";
import Recipeinfo from "./Pages/Recipes/[id]/Recipeinfo";
import Recipes from "./Pages/Recipes/Recipes";
import SubmissionSuccess from "./Pages/Submission-success/SubmissionSuccess";
import Profile from "./Pages/Users/Profile/Profile";
import MyRecipes from "./Pages/Users/Recipe/MyRecipes";
import PasswordSettings from "./Pages/Users/Settings/PasswordSettings";


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/recipes" element={<Recipes/>} />
        
        <Route path="/recipes/:id" element={<Recipeinfo />} />
        
        <Route path="/submit-recipe" element={<SubmitRecipe />} />

        <Route path="/about" element={<About/>} />

        <Route path="/submission-success" element={<SubmissionSuccess/>} />

        <Route path="/profile" element={<Profile/>} />

        <Route path="/my-recipes" element={<MyRecipes/>} />


        <Route path="/change-password" element={<PasswordSettings/>} />
        <Route path="/profile/:id/recipes/:recipeId" element={<Profile/>} />



      </Routes>
    </>
  )
}

export default App
