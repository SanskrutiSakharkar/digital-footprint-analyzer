import React from "react";
import { Link } from "react-router-dom";
import { FaCloudUploadAlt, FaShieldAlt, FaChartBar, FaExchangeAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import "./Home.css";

export default function Home() {
  return (
    <div className="hero-bg">
      <div className="hero-glow"></div>

      {/* HERO CARD */}
      <section className="hero-card">
        <h1>
          <span className="highlight">Cloud Data Footprint Analyzer</span>
        </h1>
        <p>
          Instantly audit your digital footprint.<br />
          <strong>Secure. Private. No storage.</strong>
        </p>
        <div className="hero-btns">
          <Link to="/upload" className="btn-outline btn-lg">
            <FaCloudUploadAlt aria-hidden="true" style={{ marginRight: "0.55rem" }} />
            Get Started
          </Link>
          <Link to="/about" className="btn-outline btn-lg">
            Learn More
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <motion.section
        className="features"
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.12 }}
      >
        <FeatureCard
          title="Secure Upload"
          icon={<FaShieldAlt aria-hidden="true" />}
          desc="Identity via AWS Amplify; data analyzed via a protected API. No long-term storage."
        />
        <FeatureCard
          title="Rich Visual Reports"
          icon={<FaChartBar aria-hidden="true" />}
          desc="Categories, risk levels, monthly trends. Export to CSV or PDF in a click."
        />
        <FeatureCard
          title="Compare Runs"
          icon={<FaExchangeAlt aria-hidden="true" />}
          desc="Save snapshots and see precise deltas to track clean-up progress over time."
        />
      </motion.section>
    </div>
  );
}

function FeatureCard({ title, icon, desc }) {
  return (
    <motion.div
      className="card feature-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <span className="feature-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </motion.div>
  );
}
