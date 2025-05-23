import { Link } from "react-router-dom";
import { Menu, X, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/server/firebase";
import { toast } from "sonner";

const menuItems = [
    { name: "Recipes", href: "/recipes" },
    { name: "About", href: "/about" },
];

export const Navbar = () => {
    const [menuState, setMenuState] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [user, setUser] = useState<User | null>(null);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!user) {
            e.preventDefault();
            toast("Login Required", {
                description: "You must be logged in to submit a recipe.",
                position: "top-right",
            });
            return;
        }
    };

    return (
        <header>
            <nav data-state={menuState && "active"} className="fixed z-20 w-full px-2">
                <div
                    className={cn(
                        "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
                        isScrolled && "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
                    )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link to="/" aria-label="home" className="flex items-center w-32 h-14 space-x-2">
                                <h1 className="font-bold text-3xl sm:text-5xl">Foodie</h1>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                to={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    size="sm"
                                    className={cn(isScrolled && "lg:hidden", "bg-[#0C713D] hover:bg-[#095e32]")}
                                    onClick={handleSubmitClick}>
                                    {user ? (
                                        <Link to="/submit-recipe">
                                            <span>Submit a Recipe</span>
                                        </Link>
                                    ) : (
                                        <span>Submit a Recipe</span>
                                    )}
                                </Button>
                                {!user ? (
                                    <Button size="sm" variant={"outline"} className={cn(isScrolled && "lg:hidden")}>
                                        <Link to="/auth/login">
                                            <span>Login</span>
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="sm" variant={"outline"} className="rounded-full w-9 h-9">
                                            <Link to="/account/profile">
                                                <User2 />
                                            </Link>
                                        </Button>
                                        <Button size="sm" variant={"outline"} className="cursor-pointer">
                                            <Link to="/auth/logout">
                                            <span>Logout</span>
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};