
import React from "react";
import { Code, Image, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Toggle } from "@/components/ui/toggle";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="py-6 mb-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-3 shadow-md">
              <Code className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
            Image Format Converter
          </h1>
          
          <div className="ml-4">
            <Toggle 
              pressed={theme === "dark"} 
              onPressedChange={toggleTheme}
              className="rounded-full p-2 h-8 w-8 bg-gray-100 dark:bg-gray-800"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="h-4 w-4 text-gray-700" />
              )}
            </Toggle>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Convert HEIC photos to JPG or PNG instantly. Free, secure, and all processing happens in your browser.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-300">
            Instant Conversion
          </span>
          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-300">
            No Quality Loss
          </span>
          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-300">
            Privacy First
          </span>
          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-300">
            Free to Use
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
