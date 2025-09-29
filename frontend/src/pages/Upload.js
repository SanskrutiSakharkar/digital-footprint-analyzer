// src/pages/Upload.js
import React, { useState } from "react";
import { getPresignedUrl } from "../utils/presign";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [reportData, setReportData] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setReportData(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first.");

    setUploading(true);
    setMessage("Getting presigned URL...");
    setReportData(null);

    try {
      const contentType = file.name.endsWith(".csv") ? "text/csv" : "application/json";
      const presignedUrl = await getPresignedUrl(file.name, contentType);

      setMessage("Uploading file to S3...");
      const uploadResult = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!uploadResult.ok) throw new Error(`Upload failed: ${uploadResult.status}`);

      setMessage("File uploaded! Waiting for report...");
      pollForReport(file.name);
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const pollForReport = async (filename, attempt = 0) => {
    if (!filename || attempt > 10) {
      setMessage("Report not ready after multiple attempts.");
      return;
    }

    const reportUrl = `https://digital-footprint-analyzer.s3.amazonaws.com/reports/${encodeURIComponent(
      filename
    )}_report.json`;

    try {
      const res = await fetch(reportUrl);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        setMessage("Report is ready!");
      } else {
        setTimeout(() => pollForReport(filename, attempt + 1), 3000);
      }
    } catch (err) {
      setTimeout(() => pollForReport(filename, attempt + 1), 3000);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>Upload a File</h2>
      <input type="file" onChange={handleChange} accept=".csv,.json" />
      <button disabled={uploading} onClick={handleUpload} style={{ marginLeft: 12 }}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}

      {reportData && (
        <div style={{ marginTop: 20 }}>
          <h3>Analysis Report</h3>
          <pre style={{ background: "#f3f3f3", padding: 10 }}>
            {JSON.stringify(reportData, null, 2)}
          </pre>
          <a
            href={`https://digital-footprint-analyzer.s3.amazonaws.com/reports/${encodeURIComponent(
              reportData.source_file.split("/").pop()
            )}_report.json`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb" }}
          >
            Download Report JSON
          </a>
        </div>
      )}
    </div>
  );
}
