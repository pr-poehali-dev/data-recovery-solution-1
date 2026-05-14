import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { publishApi } from "@/lib/api"

interface CalItem {
  id: string; title: string; platform: string; status: string
  scheduled_at: string | null; published_at: string | null; external_url: string | null
}

const PLATFORM_LABEL: Record<string, string> = { habr: "Habr", vc: "VC.ru", dzen: "Дзен" }
const STATUS_COLORS: Record<string, string> = {
  ready_to_publish: "bg-purple-500/20 text-purple-400", published: "bg-green-500/20 text-green-400",
  approved: "bg-yellow-500/20 text-yellow-400",
}
const PLATFORM_COLORS: Record<string, string> = { habr: "bg-blue-500/20 text-blue-400", vc: "bg-orange-500/20 text-orange-400", dzen: "bg-red-500/20 text-red-400" }

export default function Calendar() {
  const [items, setItems] = useState<CalItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publishApi.calendar().then(setItems).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center gap-2 text-zinc-400"><Icon name="Loader2" size={16} className="animate-spin" /> Загрузка...</div>

  const grouped: Record<string, CalItem[]> = {}
  for (const item of items) {
    const date = item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString("ru", { day: "numeric", month: "long" }) : "Без даты"
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(item)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Календарь публикаций</h1>
        <p className="text-zinc-400 text-sm mt-1">{items.length} статей в расписании</p>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <Icon name="CalendarDays" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Нет запланированных публикаций</p>
          <p className="text-xs mt-1">Задайте дату публикации в редакторе статей</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dateItems]) => (
          <div key={date}>
            <h3 className="text-zinc-400 text-sm font-medium mb-2 flex items-center gap-2">
              <Icon name="Calendar" size={14} />
              {date}
              <span className="text-zinc-600 font-normal">({dateItems.length})</span>
            </h3>
            <div className="space-y-2">
              {dateItems.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={`text-xs ${PLATFORM_COLORS[item.platform] || "bg-zinc-700 text-zinc-400"}`}>{PLATFORM_LABEL[item.platform] || item.platform}</Badge>
                      <Badge className={`text-xs ${STATUS_COLORS[item.status] || "bg-zinc-700 text-zinc-400"}`}>{item.status}</Badge>
                    </div>
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    {item.published_at && <p className="text-green-400 text-xs mt-0.5">Опубликовано: {new Date(item.published_at).toLocaleString("ru")}</p>}
                  </div>
                  {item.external_url && (
                    <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-zinc-500 hover:text-red-400 transition-colors">
                      <Icon name="ExternalLink" size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
