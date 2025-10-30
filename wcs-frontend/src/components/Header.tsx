import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Search } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <img src={logo} alt="Web Content Search" className="h-10 w-10" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Web Content Search
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
              isActive("/search") ? "text-primary" : "text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          <Link
            to="/docs"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/docs") ? "text-primary" : "text-foreground"
            }`}
          >
            Documentation
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Link to="/search" className="hidden sm:block">
            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80">
              Try Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
