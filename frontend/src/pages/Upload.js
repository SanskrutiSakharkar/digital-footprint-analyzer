import React, { useState } from "react";
import { getPresignedUrl } from "./utils/getPresignedUrl";

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
    if (!file) {
      alert("Please choose a file first.");
      return;
    }
    setUploading(true);
    setMessage("");
    setReportData(null);

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

      setMessage("File uploaded! Processing your report...");
      pollForReport(file.name); // Start polling for the report

      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Poll for the report in S3
  const pollForReport = async (filename, attempt = 0) => {
    if (!filename) return;
    const reportUrl =
      "https://digital-footprint-analyzer.s3.amazonaws.com/reports/" +
      encodeURIComponent(filename) +
      "_report.json";

    try {
      const res = await fetch(reportUrl);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        setMessage("Report is ready!");
      } else if (attempt < 10) {
        // Try again after 3 seconds (up to 10 tries, ~30 seconds)
        setTimeout(() => pollForReport(filename, attempt + 1), 3000);
      } else {
        setMessage("Report not ready after waiting. Please check again later.");
      }
    } catch (err) {
      if (attempt < 10) {
        setTimeout(() => pollForReport(filename, attempt + 1), 3000);
      } else {
        setMessage("Report not ready after waiting. Please check again later.");
      }
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
      {reportData && (
        <div style={{ marginTop: 20 }}>
          <h3>Analysis Report</h3>
          <pre style={{ background: "#f3f3f3", padding: 10 }}>
            {JSON.stringify(reportData, null, 2)}
          </pre>
          <a
            href={
              "https://digital-footprint-analyzer.s3.amazonaws.com/reports/" +
              encodeURIComponent(reportData.source_file.split("/").pop()) +
              "_report.json"
            }
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
