// src/components/Footer.js
import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} Cloud Data Analyzer • Built with React & AWS
      </p>
    </footer>
  );
}
