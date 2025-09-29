// Upload.js
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Upload.css"; // style your dropzone + progress

const PRESIGNED_API = "https://bc3gkr4896.execute-api.us-east-1.amazonaws.com/Dev/generate-presigned-url";

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
      // Step 1: Get pre-signed URL from API
      const presignedRes = await fetch(`${PRESIGNED_API}?filename=${encodeURIComponent(file.name)}&contentType=${file.type}`);
      if (!presignedRes.ok) throw new Error("Presigned URL generation failed");

      const { uploadUrl, key } = await presignedRes.json();
      setUploadStatus("Uploading file to S3...");
      setUploadProgress(40);

      // Step 2: Upload file directly to S3 using pre-signed URL
      const s3UploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!s3UploadRes.ok) throw new Error(`Upload to S3 failed: ${s3UploadRes.status}`);

      setUploadProgress(100);
      setUploadStatus("✅ Upload complete! Processing will begin shortly...");

      // Redirect after short delay
      setTimeout(() => navigate("/history"), 1500);

    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("❌ Upload failed. Please try again.");
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
          <p>{isDragActive ? "Drop the file here..." : "Drag & drop .csv or .json file here, or click to select"}</p>
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
