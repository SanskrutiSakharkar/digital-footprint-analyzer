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
    if (!file) return alert("Choose a file first");

    setUploading(true);
    setMessage("Getting presigned URL...");

    try {
      const contentType = file.name.endsWith(".csv") ? "text/csv" : "application/json";
      const presignedUrl = await getPresignedUrl(file.name, contentType);

      setMessage("Uploading to S3...");
      const uploadResult = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!uploadResult.ok) throw new Error(`Upload failed: ${uploadResult.status}`);

      setMessage("File uploaded! Waiting for report...");

      // 🔹 Poll for the report pre-signed URL
      pollForReport(file.name);

    } catch (err) {
      console.error(err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const pollForReport = async (filename, attempt = 0) => {
    if (attempt > 10) {
      setMessage("Report not ready after multiple attempts");
      return;
    }

    try {
      // Call Lambda or API Gateway endpoint that returns pre-signed GET URL
      const res = await fetch(`https://<your-lambda-api>/getReport?filename=${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error("Report not ready");

      const data = await res.json();
      if (data.reportUrl) {
        const reportRes = await fetch(data.reportUrl);
        const reportJson = await reportRes.json();
        setReportData(reportJson);
        setMessage("Report ready!");
      } else {
        setTimeout(() => pollForReport(filename, attempt + 1), 3000);
      }

    } catch (err) {
      setTimeout(() => pollForReport(filename, attempt + 1), 3000);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>Upload File</h2>
      <input type="file" onChange={handleChange} accept=".csv,.json" />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p>{message}</p>}

      {reportData && (
        <pre style={{ background: "#f3f3f3", padding: 10 }}>
          {JSON.stringify(reportData, null, 2)}
        </pre>
      )}
    </div>
  );
}
