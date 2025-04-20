import React from "react"
import { Search, Filter, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "@/components/recipe-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllRecipes } from "@/lib/recipes"
import { Recipe } from "@/lib/types"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const Recipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [sortBy, setSortBy] = useState<string>("popular")
    const [activeFilters, setActiveFilters] = useState<{
        cookingTime: string
        servings: string
        approvalRating: string
        authorFilters: string[]
    }>({
        cookingTime: "",
        servings: "",
        approvalRating: "",
        authorFilters: [],
    })
    const RECIPES_PER_PAGE = 8 // Number of recipes to show per page
    const [currentPage, setCurrentPage] = useState(1)

    // Get all unique categories from recipes
    const allCategories = Array.from(new Set(recipes.flatMap((recipe) => recipe.categories))).sort()

    // Get all unique authors from recipes
    const allAuthors = Array.from(new Set(recipes.map((recipe) => recipe.author.name))).sort()

    // Fetch recipes on component mount
    useEffect(() => {
        const fetchRecipes = async () => {
            const allRecipes = await getAllRecipes()
            setRecipes(allRecipes)
            setFilteredRecipes(allRecipes)
        }
        fetchRecipes()
    }, [])

    // Apply filters and sorting whenever filter criteria change
    useEffect(() => {
        let result = [...recipes]

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            result = result.filter(
                (recipe) =>
                    recipe.name.toLowerCase().includes(searchLower) ||
                    recipe.description.toLowerCase().includes(searchLower) ||
                    recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(searchLower)),
            )
        }

        // Apply category filter
        if (selectedCategory) {
            result = result.filter((recipe) => recipe.categories.includes(selectedCategory))
        }

        // Apply cooking time filter
        if (activeFilters.cookingTime) {
            switch (activeFilters.cookingTime) {
                case "under30":
                    result = result.filter((recipe) => recipe.cookTime < 30)
                    break
                case "30to60":
                    result = result.filter((recipe) => recipe.cookTime >= 30 && recipe.cookTime <= 60)
                    break
                case "over60":
                    result = result.filter((recipe) => recipe.cookTime > 60)
                    break
            }
        }

        // Apply servings filter
        if (activeFilters.servings) {
            switch (activeFilters.servings) {
                case "1to2":
                    result = result.filter((recipe) => recipe.servings <= 2)
                    break
                case "3to4":
                    result = result.filter((recipe) => recipe.servings >= 3 && recipe.servings <= 4)
                    break
                case "5plus":
                    result = result.filter((recipe) => recipe.servings >= 5)
                    break
            }
        }

        // Apply approval rating filter
        if (activeFilters.approvalRating) {
            switch (activeFilters.approvalRating) {
                case "verified":
                    result = result.filter((recipe) => recipe.approvalRating >= 70)
                    break
                case "high":
                    result = result.filter((recipe) => recipe.approvalRating >= 90)
                    break
                case "medium":
                    result = result.filter((recipe) => recipe.approvalRating >= 80 && recipe.approvalRating < 90)
                    break
                case "low":
                    result = result.filter((recipe) => recipe.approvalRating < 80)
                    break
            }
        }

        // Apply author filters
        if (activeFilters.authorFilters.length > 0) {
            result = result.filter((recipe) => activeFilters.authorFilters.includes(recipe.author.name))
        }

        // Apply sorting
        switch (sortBy) {
            case "popular":
                result.sort((a, b) => b.approvalRating - a.approvalRating)
                break
            case "recent":
                // In a real app, we would sort by date
                // For now, we'll sort by ID as a proxy for recency
                result.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id))
                break
            case "cookTime":
                result.sort((a, b) => a.cookTime - b.cookTime)
                break
            case "rating":
                result.sort((a, b) => b.votes - a.votes)
                break
        }

        setFilteredRecipes(result)
    }, [recipes, searchTerm, selectedCategory, sortBy, activeFilters])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value)
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
    }

    const toggleAuthorFilter = (authorName: string) => {
        setActiveFilters((prev) => {
            const currentAuthors = [...prev.authorFilters]
            if (currentAuthors.includes(authorName)) {
                return { ...prev, authorFilters: currentAuthors.filter((name) => name !== authorName) }
            } else {
                return { ...prev, authorFilters: [...currentAuthors, authorName] }
            }
        })
    }

    const clearFilters = () => {
        setSearchTerm("")
        setSelectedCategory("")
        setSortBy("popular")
        setActiveFilters({
            cookingTime: "",
            servings: "",
            approvalRating: "",
            authorFilters: [],
        })
    }

    // Count active filters for badge
    const activeFilterCount =
        (selectedCategory ? 1 : 0) +
        (activeFilters.cookingTime ? 1 : 0) +
        (activeFilters.servings ? 1 : 0) +
        (activeFilters.approvalRating ? 1 : 0) +
        activeFilters.authorFilters.length
    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-16 sm:py-32">
                <h1 className="text-4xl font-bold mb-8">All Recipes</h1>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search recipes or ingredients..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {allCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="recent">Most Recent</SelectItem>
                                <SelectItem value="rating">Highest Rating</SelectItem>
                                <SelectItem value="cookTime">Cooking Time</SelectItem>
                            </SelectContent>
                        </Select>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="flex gap-2">
                                    <Filter className="h-4 w-4" />
                                    More Filters
                                    {activeFilterCount > 0 && (
                                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-[#0C713D]">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Filter Recipes</SheetTitle>
                                    <SheetDescription>Refine your recipe search with these filters</SheetDescription>
                                </SheetHeader>
                                <div className="p-6 space-y-6">
                                    {/* Cooking Time Filter */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Cooking Time</h3>
                                        <div className="grid gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="under30"
                                                    checked={activeFilters.cookingTime === "under30"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            cookingTime: prev.cookingTime === "under30" ? "" : "under30",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="under30">Under 30 minutes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="30to60"
                                                    checked={activeFilters.cookingTime === "30to60"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            cookingTime: prev.cookingTime === "30to60" ? "" : "30to60",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="30to60">30-60 minutes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="over60"
                                                    checked={activeFilters.cookingTime === "over60"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            cookingTime: prev.cookingTime === "over60" ? "" : "over60",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="over60">Over 60 minutes</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Servings Filter */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Servings</h3>
                                        <div className="grid gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="1to2"
                                                    checked={activeFilters.servings === "1to2"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            servings: prev.servings === "1to2" ? "" : "1to2",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="1to2">1-2 servings</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="3to4"
                                                    checked={activeFilters.servings === "3to4"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            servings: prev.servings === "3to4" ? "" : "3to4",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="3to4">3-4 servings</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="5plus"
                                                    checked={activeFilters.servings === "5plus"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            servings: prev.servings === "5plus" ? "" : "5plus",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="5plus">5+ servings</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Approval Rating Filter */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Approval Rating</h3>
                                        <div className="grid gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="verified"
                                                    checked={activeFilters.approvalRating === "verified"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            approvalRating: prev.approvalRating === "verified" ? "" : "verified",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="verified">Verified (70%+)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="high"
                                                    checked={activeFilters.approvalRating === "high"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            approvalRating: prev.approvalRating === "high" ? "" : "high",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="high">High (90%+)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="medium"
                                                    checked={activeFilters.approvalRating === "medium"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            approvalRating: prev.approvalRating === "medium" ? "" : "medium",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="medium">Medium (80-89%)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="low"
                                                    checked={activeFilters.approvalRating === "low"}
                                                    onCheckedChange={() =>
                                                        setActiveFilters((prev) => ({
                                                            ...prev,
                                                            approvalRating: prev.approvalRating === "low" ? "" : "low",
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="low">Low (Below 80%)</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Author Filter */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Authors</h3>
                                        <div className="grid gap-2 max-h-48">
                                            {allAuthors.map((author) => (
                                                <div key={author} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`author-${author}`}
                                                        checked={activeFilters.authorFilters.includes(author)}
                                                        onCheckedChange={() => toggleAuthorFilter(author)}
                                                    />
                                                    <Label htmlFor={`author-${author}`}>{author}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <SheetFooter className="flex flex-row justify-between sm:justify-between gap-2">
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                    <SheetClose asChild>
                                        <Button className="bg-[#0C713D] hover:bg-[#095e32]">Apply Filters</Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {selectedCategory && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                Category: {selectedCategory}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                            </Badge>
                        )}
                        {activeFilters.cookingTime && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                Time:{" "}
                                {activeFilters.cookingTime === "under30"
                                    ? "Under 30 mins"
                                    : activeFilters.cookingTime === "30to60"
                                        ? "30-60 mins"
                                        : "Over 60 mins"}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setActiveFilters((prev) => ({ ...prev, cookingTime: "" }))}
                                />
                            </Badge>
                        )}
                        {activeFilters.servings && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                Servings: {activeFilters.servings === "1to2" ? "1-2" : activeFilters.servings === "3to4" ? "3-4" : "5+"}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setActiveFilters((prev) => ({ ...prev, servings: "" }))}
                                />
                            </Badge>
                        )}
                        {activeFilters.approvalRating && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                Rating:{" "}
                                {activeFilters.approvalRating === "verified"
                                    ? "Verified"
                                    : activeFilters.approvalRating === "high"
                                        ? "High"
                                        : activeFilters.approvalRating === "medium"
                                            ? "Medium"
                                            : "Low"}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setActiveFilters((prev) => ({ ...prev, approvalRating: "" }))}
                                />
                            </Badge>
                        )}
                        {activeFilters.authorFilters.map((author) => (
                            <Badge key={author} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                Author: {author}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleAuthorFilter(author)} />
                            </Badge>
                        ))}
                        {activeFilterCount > 1 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
                                Clear All
                            </Button>
                        )}
                    </div>
                )}

                {/* Recipe Grid with Pagination */}
                {filteredRecipes.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredRecipes.slice((currentPage - 1) * RECIPES_PER_PAGE, currentPage * RECIPES_PER_PAGE).map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-2">No recipes found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                        <Button onClick={clearFilters}>Clear All Filters</Button>
                    </div>
                )}

                {/* Pagination */}
                {filteredRecipes.length > 0 && (
                    <div className="flex justify-center mt-12">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            {/* Generate page buttons */}
                            {Array.from({ length: Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE) }, (_, i) => i + 1)
                                .filter((page) => {
                                    // Show first page, last page, current page, and pages around current page
                                    const maxPages = 5
                                    const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE)

                                    if (totalPages <= maxPages) return true

                                    if (page === 1 || page === totalPages) return true
                                    if (Math.abs(page - currentPage) <= 1) return true

                                    return false
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis where needed
                                    if (index > 0 && array[index - 1] !== page - 1) {
                                        return (
                                            <React.Fragment key={`ellipsis-${page}`}>
                                                <Button variant="outline" disabled className="cursor-default">
                                                    ...
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className={currentPage === page ? "bg-[#0C713D] text-white" : ""}
                                                    onClick={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            </React.Fragment>
                                        )
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant="outline"
                                            className={currentPage === page ? "bg-[#0C713D] text-white" : ""}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    )
                                })}

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE)))
                                }
                                disabled={currentPage === Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}


export default Recipes