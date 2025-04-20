import { Link } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"

const SubmissionSuccess = () => {
    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-20 sm:py-32">
                <div className="max-w-md mx-auto text-center">
                    <CheckCircle className="h-16 w-16 text-[#0C713D] mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-4">Recipe Submitted Successfully!</h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for sharing your recipe with our community. Your submission will now go through our community voting
                        process.
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg mb-8">
                        <h2 className="font-bold mb-2">What happens next?</h2>
                        <ol className="text-left text-sm space-y-2">
                            <li>1. Your recipe is now visible in the community submissions section.</li>
                            <li>2. Community members will vote on your recipe's authenticity and quality.</li>
                            <li>3. Once your recipe reaches a 70% approval rating, it will be added to our main collection.</li>
                            <li>4. You'll receive a notification when your recipe status changes.</li>
                        </ol>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/recipes">
                            <Button variant="outline">Browse Recipes</Button>
                        </Link>
                        <Link to="/submit-recipe">
                            <Button className="bg-[#0C713D] hover:bg-[#095e32]">Submit Another Recipe</Button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default SubmissionSuccess