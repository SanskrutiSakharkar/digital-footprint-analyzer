import React from "react";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaChartBar,
  FaExchangeAlt,
  FaUserCircle,
  FaGithub,
  FaGlobe,
} from "react-icons/fa";
import "./About.css";

export default function About() {
  return (
    <motion.div
      className="about-bg"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero */}
      <section className="about-hero">
        <h1>
          About <span className="highlight">Cloud Data Analyzer</span>
        </h1>
        <p>
          A lightweight app to <b>upload</b> your account data, generate clear <b>reports</b>,
          and <b>compare</b> runs side-by-side securely and fast.
        </p>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          Help everyone understand their digital footprint: what they’ve signed up for,
          where risks live, and how to clean things up with friendly visuals and privacy-first design.
        </p>
      </section>

      {/* Features */}
      <section className="about-features">
        <div className="about-feature-card">
          <span className="about-feature-icon"><FaShieldAlt /></span>
          <div>
            <h3>Privacy-First</h3>
            <p>
              Built with AWS Amplify & Cognito. Your identity is protected, and analysis runs via a secured API.
            </p>
          </div>
        </div>
        <div className="about-feature-card">
          <span className="about-feature-icon"><FaChartBar /></span>
          <div>
            <h3>Clear Insights</h3>
            <p>
              Charts for categories, monthly trends, and risk breakdowns export to CSV or PDF anytime.
            </p>
          </div>
        </div>
        <div className="about-feature-card">
          <span className="about-feature-icon"><FaExchangeAlt /></span>
          <div>
            <h3>Compare Reports</h3>
            <p>
              Save snapshots and instantly see deltas between runs to track improvements.
            </p>
          </div>
        </div>
      </section>


      {/* Team (centered) */}
      <section className="about-team-center">
        <h2>Who’s Behind It</h2>
        <div className="team-card-centered">
          <div className="team-avatar"><FaUserCircle /></div>
          <h3>Students At University of Waikato</h3>
          <p>Engineer & Designer</p>
          <div className="team-links">
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              <FaGithub /> GitHub
            </a>
            <a href="https://example.com" target="_blank" rel="noreferrer">
              <FaGlobe /> Website
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="about-contact">
        <h2>Contact</h2>
        <p>
          Questions or ideas? <a href="mailto:hello@example.com">Email us</a>.
        </p>
      </section>
    </motion.div>
  );
}
