// src/utils/getPresignedUrl.js
export async function getPresignedUrl(filename, contentType) {
  // ✅ Make sure this is your correct API Gateway URL (Production or Dev stage)
  const apiEndpoint = "https://tw3uu6mzw9.execute-api.us-east-1.amazonaws.com/Prod";
  // Add `/presign` route if your Lambda is connected to that path
  const url = `${apiEndpoint}/presign?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error("Network error: Unable to reach presign API. Check your endpoint or internet connection.");
  }

  if (!response.ok) {
    let errorMsg = `Failed to get presigned URL: ${response.status}`;
    try {
      const text = await response.text();
      if (text) errorMsg += ` - ${text}`;
    } catch {}
    throw new Error(errorMsg);
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Invalid JSON returned from presign API.");
  }

  if (!data.uploadUrl) {
    throw new Error("No uploadUrl found in presign API response.");
  }

  return data.uploadUrl;
}
