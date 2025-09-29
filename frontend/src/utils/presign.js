export async function getPresignedUrl(filename, contentType) {
  const apiEndpoint = "https://tw3uu6mzw9.execute-api.us-east-1.amazonaws.com/Prod";
  const url = `${apiEndpoint}?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to get presigned URL");
  }

  const data = await response.json();
  return data.uploadUrl;
}
