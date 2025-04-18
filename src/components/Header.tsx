
import React from "react";
import { SparklesIcon, Image, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Toggle } from "@/components/ui/toggle";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="py-6 mb-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="rounded-full bg-gradient-wizard p-3 shadow-lg animate-float">
              <SparklesIcon className="h-6 w-6 text-white animate-pulse-glow" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <div className="rounded-full bg-white p-1.5 shadow-md">
                <Image className="h-3.5 w-3.5 text-wizard-purple" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-wizard text-transparent bg-clip-text">
            Image Format Converter
          </h1>
          
          <div className="ml-4">
            <Toggle 
              pressed={theme === "dark"} 
              onPressedChange={toggleTheme}
              className="rounded-full p-2 h-8 w-8"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Toggle>
          </div>
        </div>
        <p className="text-muted-foreground max-w-md">
          Convert HEIC photos to JPG or PNG instantly. Free, secure, and all processing happens in your browser.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <span className="bg-wizard-soft-purple text-wizard-purple text-xs px-3 py-1 rounded-full">
            Instant Conversion
          </span>
          <span className="bg-wizard-soft-blue text-wizard-blue text-xs px-3 py-1 rounded-full">
            No Quality Loss
          </span>
          <span className="bg-wizard-soft-pink text-wizard-pink text-xs px-3 py-1 rounded-full">
            Privacy First
          </span>
          <span className="bg-wizard-soft-yellow text-wizard-orange text-xs px-3 py-1 rounded-full">
            Free to Use
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
