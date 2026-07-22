import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
      <div className="space-y-2">
        {/* TODO: Add active link styling and icons */}
        <Link to="/dashboard" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
          Dashboard
        </Link>
        <Link to="/companies" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
          Companies
        </Link>
        <Link to="/questions" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
          Questions
        </Link>
        <Link to="/profile" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
          Profile
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
