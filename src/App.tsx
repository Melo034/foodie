import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./server/firebase";

import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import SubmitRecipe from "./Pages/Submit/SubmitRecipe";
import Recipeinfo from "./Pages/Recipes/[id]/Recipeinfo";
import Recipes from "./Pages/Recipes/Recipes";
import SubmissionSuccess from "./Pages/Submission-success/SubmissionSuccess";
import Profile from "./Pages/Users/Profile/Profile";
import MyRecipes from "./Pages/Users/Recipe/MyRecipes";
import PasswordSettings from "./Pages/Users/Settings/PasswordSettings";
import Login from "./Pages/Auth/Login";
import SignUp from "./Pages/Auth/SignUp";
import { Navbar } from "./components/utils/Navbar";
import { Footer } from "./components/utils/Footer";
import EditRecipe from "./Pages/Submit/[username]/EditRecipe";
import UsersProfiles from "./Pages/Users/UsersProfiles/[userId]/UsersProfiles";

const ForgotPassword = () => <div>Forgot Password Page (Placeholder)</div>;
const NotFound = () => (
  <div className="container mx-auto px-4 py-64 text-center">
    <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-[#0C713D] hover:underline">
      Go back to Home
    </a>
  </div>
);


const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <>
        <Navbar/>
        <div className="container mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-3xl mx-auto">
            Loading...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipes/:id" element={<Recipeinfo />} />
      <Route path="/users/:userId" element={<UsersProfiles />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/my-recipes" element={<MyRecipes />} />
        <Route path="/account/password-settings" element={<PasswordSettings />} />
        <Route path="/submit-recipe" element={<SubmitRecipe />} />
        <Route path="/edit-recipe/:id" element={<EditRecipe/>} />
        <Route path="/submission-success" element={<SubmissionSuccess />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/auth">
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;