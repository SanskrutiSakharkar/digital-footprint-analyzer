import React from "react";
import { Link } from "react-router-dom";
import { FaCloud, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import "./NotFound.css";

export default function NotFound() {
  return (
    <motion.div
      className="notfound-bg"
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="notfound-card">
        <FaCloud className="notfound-icon" />
        <h2>Oops! Page Not Found</h2>
        <p>
          Sorry, we couldn’t find that page.<br />
          It might have moved, or never existed.
        </p>
        <Link to="/" className="btn-lg">
          <FaArrowLeft style={{ marginRight: "0.5em" }} />
          Go Home
        </Link>
        <p className="notfound-help">
          If you believe this is a mistake, please <a href="mailto:support@example.com">let us know</a>.
        </p>
      </div>
    </motion.div>
  );
}
