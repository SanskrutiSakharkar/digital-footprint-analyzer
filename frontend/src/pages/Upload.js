import React, { useState } from "react";
import { getPresignedUrl } from "./utils/getPresignedUrl";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file first.");
      return;
    }
    setUploading(true);
    setMessage("");

    try {
      const contentType = file.type || "application/octet-stream";
      setMessage("Getting upload URL...");
      const presignedUrl = await getPresignedUrl(file.name, contentType);

      setMessage("Uploading file to S3...");
      const result = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.status} - ${await result.text()}`);
      }

      setMessage("File uploaded to S3 successfully! Processing will start automatically.");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 20 }}>
      <h2>Upload a File</h2>
      <input type="file" onChange={handleChange} accept=".csv,.json" />
      <button disabled={uploading} onClick={handleUpload} style={{ marginLeft: 12 }}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}
