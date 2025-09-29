// src/utils/presign.js

export async function getPresignedUrl(filename, contentType) {
  const apiEndpoint = "https://ckbvqpr5s4.execute-api.us-east-1.amazonaws.com/Dev/presign";

  const url = `${apiEndpoint}?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to get presigned URL");
  }

  const data = await response.json();
  return data.uploadUrl;
}
