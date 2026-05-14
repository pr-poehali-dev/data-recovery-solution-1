import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { settingsApi } from "@/lib/api"

interface DashboardData {
  articles: { total: number; published: number; approved: number; drafts: number; by_platform: Record<string, number> }
  tasks: { total: number; pending: number }
  avg_geo_rating: number
  geo_metrics: { citation_rate: number; voice_share: number; sentiment_positive: number; llm_mentions_week: number; trend: string }
}

const PLATFORM_LABELS: Record<string, string> = { habr: "Habr", vc: "VC.ru", dzen: "Дзен" }

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsApi.dashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center gap-2 text-zinc-400"><Icon name="Loader2" size={16} className="animate-spin" /> Загрузка...</div>
  if (!data) return <div className="text-red-400">Ошибка загрузки</div>

  const stats = [
    { label: "Всего статей", value: data.articles.total, icon: "FileText", color: "text-blue-400" },
    { label: "Опубликовано", value: data.articles.published, icon: "CheckCircle2", color: "text-green-400" },
    { label: "Ожидают публикации", value: data.articles.approved, icon: "Clock", color: "text-yellow-400" },
    { label: "Черновики", value: data.articles.drafts, icon: "FilePen", color: "text-zinc-400" },
    { label: "Заданий в очереди", value: data.tasks.pending, icon: "ListChecks", color: "text-purple-400" },
    { label: "Средний GEO-рейтинг", value: `${data.avg_geo_rating.toFixed(1)}`, icon: "BarChart3", color: "text-red-400" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <p className="text-zinc-400 text-sm mt-1">Статистика и GEO-метрики цитируемости</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <Icon name={s.icon} size={20} className={`${s.color} mb-2`} fallback="Circle" />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GEO Metrics */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Icon name="Sparkles" size={16} className="text-red-500" />
              GEO-метрики цитируемости
              <Badge className="bg-zinc-800 text-zinc-400 text-xs ml-auto">мок</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Цитируемость в ИИ", value: `${data.geo_metrics.citation_rate}%`, icon: "Quote", color: "text-red-400" },
              { label: "Доля голоса", value: `${data.geo_metrics.voice_share}%`, icon: "Mic", color: "text-purple-400" },
              { label: "Позитивная тональность", value: `${data.geo_metrics.sentiment_positive}%`, icon: "ThumbsUp", color: "text-green-400" },
              { label: "Упоминания за неделю", value: data.geo_metrics.llm_mentions_week, icon: "MessageSquare", color: "text-blue-400" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Icon name={m.icon} size={14} className={m.color} fallback="Circle" />
                  {m.label}
                </div>
                <span className="text-white font-semibold">{m.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <Icon name={data.geo_metrics.trend === "up" ? "TrendingUp" : "Minus"} size={14} className="text-green-400" />
              <span className="text-xs text-zinc-500">Тренд: {data.geo_metrics.trend === "up" ? "растёт" : "стабильно"}</span>
            </div>
          </CardContent>
        </Card>

        {/* By platform */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Icon name="Globe" size={16} className="text-blue-400" />
              По площадкам
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.articles.by_platform || {}).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">{PLATFORM_LABELS[platform] || platform}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (count / (data.articles.total || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-white font-semibold text-sm w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(data.articles.by_platform || {}).length === 0 && (
              <p className="text-zinc-500 text-sm">Статей пока нет</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
