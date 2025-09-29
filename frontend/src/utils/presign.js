export async function getPresignedUrl(filename, contentType) {
  const res = await fetch(
    `https://bc3gkr4896.execute-api.us-east-1.amazonaws.com/Dev/presign?filename=${encodeURIComponent(filename)}&contentType=${contentType}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get URL");
  return data.uploadUrl;
}
