// src/components/Upload.js
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Upload.css";

// ✅ Set to your deployed presign API Gateway endpoint
const PRESIGNED_API = "https://ckbvqpr5s4.execute-api.us-east-1.amazonaws.com/prod/presign";

export default function Upload() {
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const uploadFile = useCallback(async (file) => {
    setFileName(file.name);
    setUploadStatus("Requesting upload URL...");
    setUploadProgress(10);

    try {
      const res = await fetch(`${PRESIGNED_API}?filename=${encodeURIComponent(file.name)}&contentType=${file.type}`);
      if (!res.ok) throw new Error("Presigned URL request failed");

      const { uploadUrl } = await res.json();
      setUploadStatus("Uploading to S3...");
      setUploadProgress(40);

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!s3Res.ok) throw new Error(`S3 Upload failed: ${s3Res.status}`);

      setUploadProgress(100);
      setUploadStatus("✅ Uploaded! Processing started via Lambda.");
      setTimeout(() => navigate("/history"), 2000);
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Upload failed. Try again.");
      setUploadProgress(0);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"]
    },
    maxFiles: 1
  });

  return (
    <motion.div className="upload-bg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="upload-card">
        <h2><FaCloudUploadAlt style={{ marginRight: "0.5rem", color: "#fca311" }} />Upload Google Takeout File</h2>

        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <p>{isDragActive ? "Drop the file here..." : "Drag & drop .csv or .json here, or click to select"}</p>
        </div>

        {fileName && (
          <>
            <p><strong>File:</strong> {fileName}</p>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="upload-status">{uploadStatus}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}
