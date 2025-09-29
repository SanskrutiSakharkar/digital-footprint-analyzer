export async function getPresignedUrl(filename, contentType) {
  const apiEndpoint = "https://tw3uu6mzw9.execute-api.us-east-1.amazonaws.com/Prod/presign";
  const url = `${apiEndpoint}?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("Network error: Unable to reach presign API");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Failed to get presigned URL: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  if (!data.uploadUrl) throw new Error("No uploadUrl in presign API response");

  return data.uploadUrl;
}
