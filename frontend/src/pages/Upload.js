// src/pages/Upload.jsx

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Upload.css";

const PRESIGNED_API = "https://bc3gkr4896.execute-api.us-east-1.amazonaws.com/Dev/generate-presigned-url";

export default function Upload() {
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const uploadFile = useCallback(async (file) => {
    setFileName(file.name);
    setUploadStatus("Preparing upload...");
    setUploadProgress(10);

    try {
      // 1. Get pre-signed URL
      const presignedRes = await fetch(
        `${PRESIGNED_API}?filename=${encodeURIComponent(file.name)}&contentType=${file.type}`
      );

      if (!presignedRes.ok) {
        throw new Error(`Presigned URL fetch failed: ${presignedRes.status}`);
      }

      const { uploadUrl, key } = await presignedRes.json();
      setUploadProgress(40);
      setUploadStatus("Uploading file to S3...");

      // 2. Upload to S3 via pre-signed URL
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!s3Res.ok) {
        if (s3Res.status === 413) {
          throw new Error("File too large (413)");
        } else if (s3Res.status === 403) {
          throw new Error("Access denied (403)");
        } else {
          throw new Error(`Upload to S3 failed: ${s3Res.status}`);
        }
      }

      setUploadProgress(100);
      setUploadStatus("File uploaded. Analysis will begin...");

      // Optional redirect
      setTimeout(() => navigate("/history"), 1500);

    } catch (err) {
      console.error("Upload error:", err.message);
      setUploadStatus(`Upload failed: ${err.message}`);
      setUploadProgress(0);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => acceptedFiles[0] && uploadFile(acceptedFiles[0]),
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  return (
    <motion.div
      className="upload-bg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="upload-card">
        <h2>
          <FaCloudUploadAlt style={{ color: "#fca311", fontSize: "2rem", marginRight: "0.6rem" }} />
          Upload your Google Takeout Data
        </h2>

        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <p>
            {isDragActive
              ? "Drop the file here..."
              : "Drag and drop your .csv or .json file here, or click to browse"}
          </p>
        </div>

        {fileName && (
          <div className="upload-status">
            <p><strong>File:</strong> {fileName}</p>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>{uploadStatus}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
