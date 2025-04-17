
import React from "react";
import { Wand2, Image } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="py-6 mb-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="rounded-full bg-gradient-wizard p-3 shadow-lg animate-float">
              <Wand2 className="h-6 w-6 text-white animate-pulse-glow" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <div className="rounded-full bg-white p-1.5 shadow-md">
                <Image className="h-3.5 w-3.5 text-wizard-purple" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-wizard text-transparent bg-clip-text">
            HEIC Wizard
          </h1>
        </div>
        <p className="text-muted-foreground max-w-md">
          Magically convert your HEIC images to PNG or JPG with a simple drag and drop
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
