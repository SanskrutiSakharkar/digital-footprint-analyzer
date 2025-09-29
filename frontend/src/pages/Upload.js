import React, { useState } from "react";
import { getPresignedUrl } from "./utils/presign";

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first.");
    setUploading(true);
    setMessage("");

    try {
      const contentType = file.type || "application/octet-stream";
      const uploadUrl = await getPresignedUrl(file.name, contentType);

      const result = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType
        },
        body: file
      });

      if (!result.ok) throw new Error(`Upload failed: ${result.status}`);

      setMessage("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`Error: ${err.message}`);
    }

    setUploading(false);
  };

  return (
    <div>
      <h2>Upload a File</h2>
      <input type="file" onChange={handleChange} />
      <button disabled={uploading} onClick={handleUpload}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Upload;
