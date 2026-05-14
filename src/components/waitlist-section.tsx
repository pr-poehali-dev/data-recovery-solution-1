import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"

export function WaitlistSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <section id="waitlist" className="py-24 bg-black border-t border-red-500/20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 text-red-400 text-sm font-medium mb-6">
          <Icon name="Clock" size={14} />
          Ранний доступ
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white font-orbitron mb-4 leading-tight">
          Войдите в лист<br />
          <span className="text-red-500">ожидания</span>
        </h2>

        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Получите доступ первыми и скидку 30% на первые 3 месяца.<br />
          Уже <span className="text-white font-semibold">147 компаний</span> в очереди.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Icon name="CheckCircle2" size={32} className="text-red-400" fallback="Check" />
            </div>
            <p className="text-white text-xl font-semibold">Вы в списке!</p>
            <p className="text-gray-400">Мы напишем на <span className="text-red-400">{email}</span>, когда откроем доступ.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-red-500 h-12 flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold h-12 px-6 shrink-0"
            >
              {loading ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : (
                "Хочу доступ"
              )}
            </Button>
          </form>
        )}

        <p className="text-gray-600 text-xs mt-4">
          Без спама. Отписаться можно в любой момент.
        </p>
      </div>
    </section>
  )
}
