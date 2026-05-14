export interface User {
  id: string
  email: string
  role: "admin" | "editor"
}

export function saveTokens(access: string, refresh?: string) {
  localStorage.setItem("access_token", access)
  if (refresh) localStorage.setItem("refresh_token", refresh)
}

export function clearTokens() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
}

export function saveUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUser(): User | null {
  try {
    const s = localStorage.getItem("user")
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token")
}
