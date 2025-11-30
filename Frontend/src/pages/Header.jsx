import React from "react";

const Header = ({ user, onLogout }) => {
  return (
    <header className="flex justify-between items-center p-4 
  bg-slate-800 text-white shadow-md">
 
      <div className="flex items-center gap-4">
        <img
          src={`http://localhost:5000/${user.profileImage}`}
          alt="profile"
          className="w-12 h-12 rounded-full object-cover border border-white"
        />
        <h2 className="text-lg font-semibold">
          Welcome, {user.name}
        </h2>
      </div>

      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg 
        hover:bg-red-600 transition"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
