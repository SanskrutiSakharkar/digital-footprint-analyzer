import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import "./Upload.css";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useNavigate } from "react-router-dom";

const API_URL = "https://bc3gkr4896.execute-api.us-east-1.amazonaws.com/Dev/analyze";

/** Save snapshot automatically so Compare can find it */
function saveAnalysisSnapshot(name, metrics, meta = {}) {
  const id = (crypto?.randomUUID?.() || `${Date.now()}_${Math.random()}`);
  const payload = { __kind: "cloud-footprint-analysis", id, name, createdAt: Date.now(), metrics, meta };
  localStorage.setItem(`analysis:${id}`, JSON.stringify(payload));
  return id;
}

function decodeJwtClaims(jwt) {
  try {
    const [, payload] = jwt.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function Upload() {
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  // -- Main file upload logic --
  const uploadFile = useCallback(async (file) => {
    setFileName(file.name);
    setProgress(30);
    setUploadStatus("");
    setResult(null);

    const content = await file.text();

    try {
      // --- For local .json test uploads, skip API ---
      if (file.name.endsWith(".json")) {
        const data = JSON.parse(content);
        setResult(data);
        localStorage.setItem("lastAnalysis", JSON.stringify(data));
        saveAnalysisSnapshot(`Upload ${new Date().toLocaleString()}`, data, { source: "upload-local" });
        setProgress(100);
        setTimeout(() => {
          setUploadStatus("success");
          navigate("/report", { state: { analysis: data } });
        }, 300);
        return;
      }

      // --- For .csv or prod .json: send to API ---
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();
      if (!idToken) throw new Error("No ID token found. Please sign in first.");

      const claims = decodeJwtClaims(idToken);
      console.log("JWT claims:", claims);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": file.name.endsWith(".csv") ? "text/csv" : "application/json",
          "Authorization": idToken,
        },
        body: content,
      });

      setProgress(70);

      if (!response.ok) {
        let bodyText = "";
        try { bodyText = await response.text(); } catch {}
        throw new Error(`Upload failed: ${response.status} ${response.statusText} ${bodyText}`);
      }

      const data = await response.json();
      setResult(data);
      localStorage.setItem("lastAnalysis", JSON.stringify(data));
      saveAnalysisSnapshot(`Upload ${new Date().toLocaleString()}`, data, { source: "upload" });
      setProgress(100);
      setTimeout(() => {
        setUploadStatus("success");
        navigate("/report", { state: { analysis: data } });
      }, 300);

    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setResult({ error: err?.message || String(err) });
      setProgress(0);
    }
  }, [navigate]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) uploadFile(acceptedFiles[0]);
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/json": [".json"] },
    maxFiles: 1,
  });

  const handleManualUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  return (
    <motion.div className="upload-bg" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }}>
      <div className="upload-card">
        <h2>
          <FaCloudUploadAlt style={{ color: "#fca311", fontSize: "2rem", marginRight: "0.7rem" }} />
          Upload Your Account Data
        </h2>

        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop your file here ...</p> : (
            <p>
              Drag & drop a <b>.csv</b> or <b>.json</b> file here,
              <br />or <span className="browse-btn">browse</span> your computer.
            </p>
          )}
        </div>

        <input type="file" accept=".csv,.json" id="file-input" style={{ display: "none" }} onChange={handleManualUpload} />
        <label htmlFor="file-input" className="manual-upload-label">Or click here to select a file</label>

        {fileName && (
          <div className="file-details">
            <span className="file-name">{fileName}</span>
            <div className="progress-bar-outer"><div className="progress-bar-inner" style={{ width: `${progress}%` }} /></div>
            {progress === 100 && (
              <div className={`upload-status ${uploadStatus}`}>
                {uploadStatus === "success" ? "Upload successful! 🎉" :
                 uploadStatus === "error"   ? "Upload failed. Try again." : ""}
              </div>
            )}
          </div>
        )}

        {result && result.error && <div className="result-area error">{result.error}</div>}
      </div>
    </motion.div>
  );
}
