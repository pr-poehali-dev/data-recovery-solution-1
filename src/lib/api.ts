import func2url from "../../backend/func2url.json"

const URLS = func2url as Record<string, string>

function getToken() {
  return localStorage.getItem("access_token") || ""
}

async function request(fn: string, path: string, method = "GET", body?: unknown) {
  const base = URLS[fn]
  const url = `${base}${path}`
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw { status: res.status, message: data.error || "Error", data }
  return data
}

// Auth
export const authApi = {
  login: (email: string, password: string) => request("auth", "/login", "POST", { email, password }),
  me: () => request("auth", "/me"),
  refresh: (refresh_token: string) => request("auth", "/refresh", "POST", { refresh_token }),
}

// Tasks
export const tasksApi = {
  list: (params?: { priority?: string; status?: string }) => {
    const q = new URLSearchParams(params as Record<string, string> || {}).toString()
    return request("tasks", q ? `/?${q}` : "/")
  },
  create: (data: Record<string, string>) => request("tasks", "/", "POST", data),
  update: (id: string, data: Record<string, unknown>) => request("tasks", `/${id}`, "PUT", data),
  pollDashboard: () => request("tasks", "/poll-dashboard", "POST"),
}

// Articles
export const articlesApi = {
  list: (params?: { status?: string; platform?: string }) => {
    const q = new URLSearchParams(params as Record<string, string> || {}).toString()
    return request("articles", q ? `/?${q}` : "/")
  },
  get: (id: string) => request("articles", `/${id}`),
  update: (id: string, data: Record<string, unknown>) => request("articles", `/${id}`, "PUT", data),
  generate: (task_id: string, platform: string) => request("articles", "/generate", "POST", { task_id, platform }),
}

// Publish
export const publishApi = {
  publish: (article_id: string, platforms: string[]) => request("publish", "/publish", "POST", { article_id, platforms }),
  logs: () => request("publish", "/logs"),
  calendar: () => request("publish", "/calendar"),
}

// Settings
export const settingsApi = {
  dashboard: () => request("settings", "/dashboard"),
  platforms: () => request("settings", "/platforms"),
  updatePlatform: (platform: string, data: Record<string, unknown>) => request("settings", `/platforms/${platform}`, "PUT", data),
  appSettings: () => request("settings", "/app-settings"),
  updateAppSettings: (data: Record<string, string>) => request("settings", "/app-settings", "PUT", data),
  promptTemplates: () => request("settings", "/prompt-templates"),
  updatePromptTemplate: (id: string, data: Record<string, unknown>) => request("settings", `/prompt-templates/${id}`, "PUT", data),
}
