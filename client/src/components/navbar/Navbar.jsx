import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-800">
          HackSprint AI
        </span>
      </div>
      {/* TODO: Add search bar, notification center, and user profile avatar */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">Placeholder Navbar</span>
      </div>
    </nav>
  );
};

export default Navbar;
