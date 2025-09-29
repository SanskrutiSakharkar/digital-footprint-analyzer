export async function getPresignedUrl(filename, contentType) {
  const apiEndpoint = "https://tw3uu6mzw9.execute-api.us-east-1.amazonaws.com/Prod/presign";

  // Create URL object and append query params
  const url = new URL(apiEndpoint);
  url.searchParams.append("filename", filename);
  url.searchParams.append("contentType", contentType);

  let response;
  try {
    response = await fetch(url.toString());
  } catch (err) {
    throw new Error("Network error: Unable to reach presign API");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Failed to get presigned URL: ${response.status} - ${errorBody}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid JSON returned from presign API");
  }

  if (!data.uploadUrl) throw new Error("No uploadUrl in presign API response");

  return data.uploadUrl;
}
