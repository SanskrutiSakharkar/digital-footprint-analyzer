// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Report from "./pages/Report";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import CompareReports from "./pages/CompareReports";

import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Hub } from "aws-amplify/utils";

// ✅ Amplify v6+ configuration (no default Auth export)
Amplify.configure({
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: "us-east-1_OilL5RBTl",
      userPoolClientId: "6mmnueqgb88kc5dt97lt56l97h", // public SPA client
    },
  },
});

Hub.listen("auth", ({ payload }) => {
  console.log("[Auth event]", payload.event, payload.data);
});

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/report" element={<Report />} />
        <Route path="/compare" element={<CompareReports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

// Ask for name at signup so Profile can show it; you can pare this down if needed.
export default withAuthenticator(App, {
  loginMechanisms: ["username", "email"],
  signUpAttributes: ["email", "name"],
});
