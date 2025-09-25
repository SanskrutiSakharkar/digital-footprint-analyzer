// Navbar.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-row">
        <div className="brand">
          {/* Logo + Brand */}
          <img src="/logo.png" alt="Logo" className="brand-logo" />
          <span className="brand-text">Cloud Data Analyzer</span>
        </div>
        <div className="links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/upload">Upload</NavLink>
          <NavLink to="/report">Report</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/about">About</NavLink>
        </div>
      </div>
    </nav>
  );
}
