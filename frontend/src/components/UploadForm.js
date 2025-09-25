// src/components/UploadForm.js
import React, { useState } from "react";

export default function UploadForm({ onAnalyze }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert("Select a file first!");
    onAnalyze && onAnalyze(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept=".csv,.json"
        className="file-input"
        onChange={handleFileChange}
      />
      <br />
      <button className="btn" type="submit">
        Analyze
      </button>
    </form>
  );
}
