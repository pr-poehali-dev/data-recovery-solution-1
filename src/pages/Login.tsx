import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api"
import { saveTokens, saveUser } from "@/lib/auth"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("admin")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await authApi.login(email, password)
      saveTokens(data.access_token, data.refresh_token)
      saveUser(data.user)
      navigate("/app/dashboard")
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message || "Ошибка входа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-2xl font-bold text-white">
            Geo<span className="text-red-500">Content</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Войдите в систему управления контентом</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Вход</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">Пароль</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
                {loading ? "Входим..." : "Войти"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
