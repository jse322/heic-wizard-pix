
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-6 mt-12 border-t">
      <div className="text-center text-sm text-muted-foreground">
        <p>HEIC Wizard &copy; {new Date().getFullYear()} - Converts your images with magic ✨</p>
        <p className="mt-1">All conversions happen in your browser, your files are never uploaded to any server.</p>
      </div>
    </footer>
  );
};

export default Footer;
