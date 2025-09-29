// utils/presign.js
export async function getPresignedUrl(filename, contentType) {
  // ✅ Your API Gateway endpoint
  const apiEndpoint = "https://tw3uu6mzw9.execute-api.us-east-1.amazonaws.com/Prod";
  const url = `${apiEndpoint}/presign?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

  let response, data;

  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error("Network error: Unable to reach presign API");
  }

  if (!response.ok) {
    let errorMsg = `Failed to get presigned URL: ${response.status}`;
    try {
      const errorBody = await response.text();
      errorMsg += ` - ${errorBody}`;
    } catch {}
    throw new Error(errorMsg);
  }

  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Invalid JSON returned from presign API");
  }

  if (!data.uploadUrl) throw new Error("No uploadUrl in presign API response");

  return data.uploadUrl;
}
