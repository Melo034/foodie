import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import foodie from "../../assets/Hero.jpg"

const About = () => {
  return (
    <div className="container px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">About Sierra Leone Recipes</h1>

      <div className="relative h-[300px] rounded-xl overflow-hidden mb-8">
        <img src={foodie} alt="Sierra Leonean Food" className="object-cover" />
      </div>

      <div className="space-y-6">
        <p className="text-lg">
          Welcome to Sierra Leone Recipes, a community-driven platform dedicated to preserving and sharing the rich
          culinary heritage of Sierra Leone. Our mission is to create the most comprehensive collection of authentic
          Sierra Leonean recipes, making them accessible to food enthusiasts around the world.
        </p>

        <h2 className="text-2xl font-bold">Our Story</h2>
        <p>
          Sierra Leone Recipes was founded in 2023 by a group of food enthusiasts with roots in Sierra Leone.
          Recognizing that many traditional recipes were being lost as they were passed down orally through
          generations, we created this platform to document and preserve these culinary treasures.
        </p>

        <h2 className="text-2xl font-bold">Community-Driven Approach</h2>
        <p>
          What makes our platform unique is our community validation system. We believe that the best judges of
          authenticity are those who have grown up with these dishes. That's why we've implemented a voting system
          where community members can rate recipes based on their authenticity and accuracy.
        </p>
        <p>
          Recipes that achieve a 70% or higher approval rating from our community are automatically added to our main
          collection, ensuring that only the most authentic recipes are featured prominently.
        </p>

        <h2 className="text-2xl font-bold">Our Collection</h2>
        <p>
          Our collection features a wide range of Sierra Leonean dishes, from everyday staples like Jollof Rice and
          Cassava Leaf Soup to special occasion foods like Coconut Rice and festive treats. Each recipe includes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Detailed ingredients with measurements</li>
          <li>Step-by-step preparation instructions</li>
          <li>High-quality images</li>
          <li>Cultural context and history</li>
          <li>Tips and variations</li>
        </ul>

        <h2 className="text-2xl font-bold">Join Our Community</h2>
        <p>
          We invite you to join our community of food enthusiasts, whether you're Sierra Leonean, have connections to
          Sierra Leone, or are simply interested in exploring new cuisines. Share your family recipes, vote on
          submissions, and help us preserve the culinary heritage of Sierra Leone for future generations.
        </p>

        <div className="flex gap-4 pt-4">
          <Link to="/signup">
            <Button className="bg-[#0C713D] hover:bg-[#095e32]">Sign Up</Button>
          </Link>
          <Link to="/recipes">
            <Button variant="outline">Browse Recipes</Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
  )
}

export default About