// --- UploadPage.jsx (React Frontend using Presigned URL) ---
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import "./Upload.css";
import { useNavigate } from "react-router-dom";

const PRESIGNED_API = "https://bc3gkr4896.execute-api.us-east-1.amazonaws.com/Dev/generate-presigned-url";

export default function Upload() {
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const uploadFile = useCallback(async (file) => {
    setFileName(file.name);
    setUploadStatus("Uploading...");
    setUploadProgress(10);

    try {
      const presignedRes = await fetch(`${PRESIGNED_API}?filename=${encodeURIComponent(file.name)}&contentType=${file.type}`);
      const { uploadUrl, key } = await presignedRes.json();
      setUploadProgress(40);

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!s3Res.ok) throw new Error("Upload to S3 failed");

      setUploadProgress(100);
      setUploadStatus(" File uploaded. Processing will start shortly.");

      // Navigate to history or dashboard
      setTimeout(() => navigate("/history"), 1000);

    } catch (err) {
      console.error(err);
      setUploadStatus("Upload failed");
      setUploadProgress(0);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => acceptedFiles[0] && uploadFile(acceptedFiles[0]),
    accept: { "text/csv": [".csv"], "application/json": [".json"] },
    maxFiles: 1,
  });

  return (
    <motion.div className="upload-bg" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }}>
      <div className="upload-card">
        <h2><FaCloudUploadAlt style={{ color: "#fca311", fontSize: "2rem", marginRight: "0.7rem" }} />Upload your Google Takeout</h2>

        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <p>{isDragActive ? "Drop the file here..." : "Drag and drop .csv or .json file here, or click to select."}</p>
        </div>

        {fileName && (
          <>
            <p><strong>File:</strong> {fileName}</p>
            <div className="progress-bar-outer"><div className="progress-bar-inner" style={{ width: `${uploadProgress}%` }} /></div>
            <p>{uploadStatus}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}