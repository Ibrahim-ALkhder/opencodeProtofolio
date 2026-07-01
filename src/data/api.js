const API_BASE = import.meta.env.VITE_API_URL || "/api";

function fetchOpts(options = {}) {
  return {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };
}

async function fetchData(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, fetchOpts(options));
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API fetch failed for ${endpoint}:`, err.message);
    return null;
  }
}

export async function apiGetProjects(limit, offset) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (offset) params.set("offset", offset);
  const qs = params.toString();
  return fetchData(`/projects${qs ? "?" + qs : ""}`);
}

export async function apiGetProject(id) {
  return fetchData(`/projects/${id}`);
}

export async function apiCreateProject(data) {
  let slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
  if (!slug) slug = "project-" + Date.now();
  return fetchData("/projects", {
    method: "POST",
    body: JSON.stringify({ ...data, slug }),
  });
}

export async function apiUpdateProject(id, data) {
  return fetchData(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteProject(id) {
  return fetchData(`/projects/${id}`, { method: "DELETE" });
}

export async function apiUploadProjectScreenshot(id, type, file) {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await fetch(`${API_BASE}/projects/${id}/screenshots/${type}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Screenshot upload failed");
    return await res.json();
  } catch (err) {
    console.warn("Screenshot upload failed:", err.message);
    return null;
  }
}

export async function apiUploadCertificateThumbnail(id, file) {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await fetch(`${API_BASE}/certificates/${id}/thumbnail`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Thumbnail upload failed");
    return await res.json();
  } catch (err) {
    console.warn("Thumbnail upload failed:", err.message);
    return null;
  }
}

export async function apiGetCertificates(limit, offset) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (offset) params.set("offset", offset);
  const qs = params.toString();
  return fetchData(`/certificates${qs ? "?" + qs : ""}`);
}

export async function apiGetCertificate(id) {
  return fetchData(`/certificates/${id}`);
}

export async function apiCreateCertificate(data) {
  return fetchData("/certificates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateCertificate(id, data) {
  return fetchData(`/certificates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteCertificate(id) {
  return fetchData(`/certificates/${id}`, { method: "DELETE" });
}

export async function apiGetCv() {
  return fetchData("/cv");
}

export async function apiUploadCv(file) {
  const formData = new FormData();
  formData.append("cv", file);
  try {
    const res = await fetch(`${API_BASE}/cv/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return await res.json();
  } catch (err) {
    console.warn("CV upload failed:", err.message);
    return null;
  }
}

export async function apiSetCvUrl(url) {
  return fetchData("/cv/url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function apiLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    return await res.json();
  } catch (err) {
    console.warn("Login failed:", err.message);
    return null;
  }
}

export async function apiLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore
  }
}

export async function apiIsAuthenticated() {
  try {
    const res = await fetch(`${API_BASE}/auth/check`, {
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated;
  } catch {
    return false;
  }
}
