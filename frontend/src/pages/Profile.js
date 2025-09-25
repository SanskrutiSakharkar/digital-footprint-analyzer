import React, { useEffect, useState } from "react";
import { FaUserCircle, FaEnvelope, FaEdit, FaHistory, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttribute,
  signOut
} from "@aws-amplify/auth";
import "./Profile.css";

function pickDisplayName(attrs, user) {
  const given = attrs?.given_name?.trim?.();
  const family = attrs?.family_name?.trim?.();
  const combined = [given, family].filter(Boolean).join(" ");
  return (
    attrs?.name?.trim?.() ||
    (combined || "").trim() ||
    attrs?.preferred_username?.trim?.() ||
    user?.username ||
    "User"
  );
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("—");
  const [email, setEmail] = useState("—");
  const [lastLogin, setLastLogin] = useState("");
  const [uploads] = useState([
    { file: "accounts_2025-09-19.csv", date: "2025-09-19 18:32" },
    { file: "my_google.json", date: "2025-08-14 13:20" },
  ]);

  async function loadProfile() {
    const user = await getCurrentUser();
    setLastLogin(new Date().toLocaleString());
    const attrs = await fetchUserAttributes();
    setEmail(attrs?.email || user?.username || "—");
    setName(pickDisplayName(attrs, user));
  }

  useEffect(() => {
    (async () => {
      try {
        await loadProfile();
      } catch (e) {
        console.error("Profile load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    try {
      await updateUserAttribute({
        userAttribute: { name: "name", value: name },
      });
      await loadProfile();
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert(err?.message || "Failed to update profile.");
    }
  }

  function handleDelete() {
    if (window.confirm("Are you sure? This will permanently delete your account.")) {
      alert("Wire this to your backend/Cognito delete flow.");
    }
  }

  if (loading) {
    return (
      <div className="profile-bg">
        <div className="profile-card"><p>Loading profile…</p></div>
      </div>
    );
  }

  return (
    <motion.div
      className="profile-bg"
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85 }}
    >
      <div className="profile-card">
        <div className="avatar-section">
          <FaUserCircle style={{ fontSize: "4.6rem", color: "#fca311" }} />
        </div>

        {editing ? (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-row">
              <FaUserCircle className="form-icon" />
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-row">
              <FaEnvelope className="form-icon" />
              <input type="email" value={email} readOnly />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button className="btn" type="submit">Save</button>
              <button className="btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h2>{name}</h2>
            <p className="profile-email">
              <FaEnvelope style={{ fontSize: "1em", marginRight: "0.5em" }} /> {email}
            </p>
            <button className="btn-edit-profile" onClick={() => setEditing(true)}>
              <FaEdit style={{ marginRight: "0.5em" }} /> Edit Info
            </button>
          </>
        )}

        <div className="activity-section">
          <h4><FaHistory style={{ marginRight: "0.5em" }} /> Recent Activity</h4>
          <ul>
            <li>Last login: <b>{lastLogin || "—"}</b></li>
            <li>Last upload: <b>{uploads?.[0]?.date || "—"}</b></li>
          </ul>
          <h5>Uploads:</h5>
          <ul>
            {uploads.map((u, idx) => (
              <li key={idx}>
                <span className="upload-file">{u.file}</span>
                <span className="upload-date">{u.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="danger-section">
          <button className="btn-danger" onClick={handleDelete}>
            <FaTrash style={{ marginRight: "0.5em" }} />
            Delete Account
          </button>
          <button className="btn-secondary" style={{ marginLeft: 12 }} onClick={() => signOut().catch(console.error)}>
            Sign out
          </button>
        </div>
      </div>
    </motion.div>
  );
}
