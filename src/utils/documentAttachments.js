const BACKBLAZE_DOWNLOAD_PREFIX =
  "https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=";

function getAttachmentPath(attachment) {
  if (attachment?.download_url) return attachment.download_url;
  if (attachment?.url) return attachment.url;
  if (attachment?.public_id) {
    return `${BACKBLAZE_DOWNLOAD_PREFIX}${attachment.public_id}`;
  }
  return "";
}

function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url);
}

export async function openDocumentAttachment(api, attachment) {
  const resource = getAttachmentPath(attachment);
  if (!resource) return false;

  if (isAbsoluteUrl(resource)) {
    window.open(resource, "_blank", "noopener,noreferrer");
    return true;
  }

  const response = await api.get(resource, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(response.data);
  const link = window.document.createElement("a");
  link.href = blobUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
  return true;
}

export async function loadDocumentAttachmentPreview(api, attachment) {
  const resource = getAttachmentPath(attachment);
  if (!resource) {
    return { url: "", revoke: () => {} };
  }

  if (isAbsoluteUrl(resource)) {
    return { url: resource, revoke: () => {} };
  }

  const response = await api.get(resource, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(response.data);
  return {
    url: blobUrl,
    revoke: () => window.URL.revokeObjectURL(blobUrl),
  };
}
