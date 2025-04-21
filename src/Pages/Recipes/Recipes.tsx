import React, { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipe-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Recipe } from "@/lib/types";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/server/firebase";
import { toast, Toaster } from "sonner";

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [activeFilters, setActiveFilters] = useState<{
    cookingTime: string;
    servings: string;
    approvalRating: string;
    authorFilters: string[];
  }>({
    cookingTime: "",
    servings: "",
    approvalRating: "",
    authorFilters: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const RECIPES_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch recipes from Firestore on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        const recipesCollection = collection(db, "recipes");
        const recipesSnapshot = await getDocs(recipesCollection);
        const allRecipes = recipesSnapshot.docs.map((doc) => {
          const data = doc.data();
          // Log warnings for missing or incomplete data
          if (!data.author || !data.author.id || !data.author.name) {
            console.warn(`Recipe ${doc.id} is missing author data. Setting default.`);
          }
          if (!data.ingredients || !Array.isArray(data.ingredients)) {
            console.warn(`Recipe ${doc.id} is missing ingredients. Setting default.`);
          }
          return {
            id: doc.id,
            name: data.name || "Untitled Recipe",
            description: data.description || "",
            image: data.image || undefined,
            cookTime: data.cookTime || 0,
            servings: data.servings || 1,
            categories: data.categories && Array.isArray(data.categories) ? data.categories : [],
            createdAt: data.createdAt ? (typeof data.createdAt === "string" ? data.createdAt : data.createdAt.toDate().toISOString()) : new Date().toISOString(),
            approvalRating: data.approvalRating || 0,
            voteCount: data.voteCount || 0,
            ingredients: data.ingredients && Array.isArray(data.ingredients) ? data.ingredients : [],
            instructions: data.instructions && Array.isArray(data.instructions) ? data.instructions : [],
            tips: data.tips && Array.isArray(data.tips) ? data.tips : undefined,
            author: data.author && data.author.id && data.author.name
              ? {
                  id: data.author.id,
                  name: data.author.name,
                  avatar: data.author.avatar || undefined,
                  bio: data.author.bio || undefined,
                  recipesCount: data.author.recipesCount || 0,
                }
              : { id: "unknown", name: "Anonymous User", recipesCount: 0 },
            comments: data.comments && Array.isArray(data.comments) ? data.comments : [],
          } as Recipe;
        });
        setRecipes(allRecipes);
        setFilteredRecipes(allRecipes);
      } catch (err: unknown) {
        console.error("Error loading recipes:", err);
        setError("Failed to load recipes. Please try again later.");
        toast.error("Error", { description: "Failed to load recipes. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Get all unique categories and authors
  const allCategories = Array.from(new Set(recipes.flatMap((recipe) => recipe.categories))).sort();
  const allAuthors = Array.from(
    new Set(recipes.map((recipe) => recipe.author.name).filter((name) => name && name !== "Anonymous User"))
  ).sort();

  // Apply filters and sorting
  useEffect(() => {
    let result = [...recipes];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.author.name.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((recipe) => recipe.categories.includes(selectedCategory));
    }

    // Cooking time filter
    if (activeFilters.cookingTime) {
      switch (activeFilters.cookingTime) {
        case "under30":
          result = result.filter((recipe) => recipe.cookTime > 0 && recipe.cookTime < 30);
          break;
        case "30to60":
          result = result.filter((recipe) => recipe.cookTime >= 30 && recipe.cookTime <= 60);
          break;
        case "over60":
          result = result.filter((recipe) => recipe.cookTime > 60);
          break;
      }
    }

    // Servings filter
    if (activeFilters.servings) {
      switch (activeFilters.servings) {
        case "1to2":
          result = result.filter((recipe) => recipe.servings > 0 && recipe.servings <= 2);
          break;
        case "3to4":
          result = result.filter((recipe) => recipe.servings >= 3 && recipe.servings <= 4);
          break;
        case "5plus":
          result = result.filter((recipe) => recipe.servings >= 5);
          break;
      }
    }

    // Approval rating filter
    if (activeFilters.approvalRating) {
      switch (activeFilters.approvalRating) {
        case "verified":
          result = result.filter((recipe) => recipe.approvalRating >= 70);
          break;
        case "high":
          result = result.filter((recipe) => recipe.approvalRating >= 90);
          break;
        case "medium":
          result = result.filter((recipe) => recipe.approvalRating >= 80 && recipe.approvalRating < 90);
          break;
        case "low":
          result = result.filter((recipe) => recipe.approvalRating > 0 && recipe.approvalRating < 80);
          break;
      }
    }

    // Author filter
    if (activeFilters.authorFilters.length > 0) {
      result = result.filter((recipe) => activeFilters.authorFilters.includes(recipe.author.name));
    }

    // Sorting
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.approvalRating - a.approvalRating || b.voteCount - a.voteCount);
        break;
      case "recent":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "cookTime":
        result.sort((a, b) => a.cookTime - b.cookTime);
        break;
      case "rating":
        result.sort((a, b) => b.voteCount - a.voteCount || b.approvalRating - a.approvalRating);
        break;
    }

    setFilteredRecipes(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [recipes, searchTerm, selectedCategory, sortBy, activeFilters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const toggleAuthorFilter = (authorName: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      authorFilters: prev.authorFilters.includes(authorName)
        ? prev.authorFilters.filter((name) => name !== authorName)
        : [...prev.authorFilters, authorName],
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("popular");
    setActiveFilters({
      cookingTime: "",
      servings: "",
      approvalRating: "",
      authorFilters: [],
    });
  };

  // Count active filters
  const activeFilterCount =
    (selectedCategory && selectedCategory !== "all" ? 1 : 0) +
    (activeFilters.cookingTime ? 1 : 0) +
    (activeFilters.servings ? 1 : 0) +
    (activeFilters.approvalRating ? 1 : 0) +
    activeFilters.authorFilters.length;

  // Pagination
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const displayedRecipes = filteredRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16 sm:py-32">
        <h1 className="text-4xl font-bold mb-8">Community Recipes</h1>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2 text-red-600">{error}</h3>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search recipes, ingredients, or authors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                  aria-label="Search recipes"
                />
              </div>
              <div className="flex gap-4 flex-wrap">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">
                      All Categories
                    </SelectItem>
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
                    <SelectItem key="popular" value="popular">
                      Most Popular
                    </SelectItem>
                    <SelectItem key="recent" value="recent">
                      Most Recent
                    </SelectItem>
                    <SelectItem key="rating" value="rating">
                      Highest Rated
                    </SelectItem>
                    <SelectItem key="cookTime" value="cookTime">
                      Cooking Time
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
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
                      <SheetDescription>Refine your recipe search</SheetDescription>
                    </SheetHeader>
                    <div className="p-6 space-y-6">
                      {/* Cooking Time Filter */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Cooking Time</h3>
                        <div className="grid gap-2">
                          {[
                            { id: "under30", label: "Under 30 minutes" },
                            { id: "30to60", label: "30-60 minutes" },
                            { id: "over60", label: "Over 60 minutes" },
                          ].map(({ id, label }) => (
                            <div key={id} className="flex items-center space-x-2">
                              <Checkbox
                                id={id}
                                checked={activeFilters.cookingTime === id}
                                onCheckedChange={() =>
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    cookingTime: prev.cookingTime === id ? "" : id,
                                  }))
                                }
                              />
                              <Label htmlFor={id}>{label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Servings Filter */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Servings</h3>
                        <div className="grid gap-2">
                          {[
                            { id: "1to2", label: "1-2 servings" },
                            { id: "3to4", label: "3-4 servings" },
                            { id: "5plus", label: "5+ servings" },
                          ].map(({ id, label }) => (
                            <div key={id} className="flex items-center space-x-2">
                              <Checkbox
                                id={id}
                                checked={activeFilters.servings === id}
                                onCheckedChange={() =>
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    servings: prev.servings === id ? "" : id,
                                  }))
                                }
                              />
                              <Label htmlFor={id}>{label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Approval Rating Filter */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Approval Rating</h3>
                        <div className="grid gap-2">
                          {[
                            { id: "verified", label: "Verified (70%+)" },
                            { id: "high", label: "High (90%+)" },
                            { id: "medium", label: "Medium (80-89%)" },
                            { id: "low", label: "Low (<80%)" },
                          ].map(({ id, label }) => (
                            <div key={id} className="flex items-center space-x-2">
                              <Checkbox
                                id={id}
                                checked={activeFilters.approvalRating === id}
                                onCheckedChange={() =>
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    approvalRating: prev.approvalRating === id ? "" : id,
                                  }))
                                }
                              />
                              <Label htmlFor={id}>{label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Author Filter */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Authors</h3>
                        <div className="grid gap-2 max-h-48 overflow-y-auto">
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
                {selectedCategory && selectedCategory !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    Category: {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                  </Badge>
                )}
                {activeFilters.cookingTime && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    Time: {activeFilters.cookingTime === "under30" ? "Under 30 mins" : activeFilters.cookingTime === "30to60" ? "30-60 mins" : "Over 60 mins"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setActiveFilters((prev) => ({ ...prev, cookingTime: "" }))} />
                  </Badge>
                )}
                {activeFilters.servings && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    Servings: {activeFilters.servings === "1to2" ? "1-2" : activeFilters.servings === "3to4" ? "3-4" : "5+"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setActiveFilters((prev) => ({ ...prev, servings: "" }))} />
                  </Badge>
                )}
                {activeFilters.approvalRating && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    Rating: {activeFilters.approvalRating === "verified" ? "Verified" : activeFilters.approvalRating === "high" ? "High" : activeFilters.approvalRating === "medium" ? "Medium" : "Low"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setActiveFilters((prev) => ({ ...prev, approvalRating: "" }))} />
                  </Badge>
                )}
                {activeFilters.authorFilters.map((author) => (
                  <Badge key={author} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    Author: {author}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleAuthorFilter(author)} />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
                  Clear All
                </Button>
              </div>
            )}

            {/* Recipe Grid */}
            {filteredRecipes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedRecipes.map((recipe) => (
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
            {filteredRecipes.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      const maxPages = 5;
                      if (totalPages <= maxPages) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .reduce((acc: React.ReactElement[], page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        acc.push(
                          <Button key={`ellipsis-${page}`} variant="outline" disabled className="cursor-default">
                            ...
                          </Button>
                        );
                      }
                      acc.push(
                        <Button
                          key={page}
                          variant="outline"
                          className={currentPage === page ? "bg-[#0C713D] text-white" : ""}
                          onClick={() => setCurrentPage(page)}
                          aria-label={`Page ${page}`}
                        >
                          {page}
                        </Button>
                      );
                      return acc;
                    }, [])}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <Toaster richColors position="top-center" closeButton={false} />
    </>
  );
};

export default Recipes;