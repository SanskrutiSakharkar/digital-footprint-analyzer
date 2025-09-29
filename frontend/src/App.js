import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// UI Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Report from "./pages/Report";
import CompareReports from "./pages/CompareReports";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// AWS Amplify v6+
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Hub } from "aws-amplify/utils";

// ✅ Configure Amplify Auth (Cognito)
Amplify.configure({
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: "us-east-1_OilL5RBTl",
      userPoolClientId: "6mmnueqgb88kc5dt97lt56l97h", // SPA client
    },
  },
});

// ✅ Debug auth events (optional)
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

// ✅ Export app wrapped with Cognito UI Auth
export default withAuthenticator(App, {
  loginMechanisms: ["email", "username"], // login via email or username
  signUpAttributes: ["email", "name"],    // ask for name at signup
});
