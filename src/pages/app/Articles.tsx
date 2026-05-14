import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"
import { articlesApi, publishApi } from "@/lib/api"

interface Article {
  id: string; title: string; platform: string; status: string
  geo_rating: string; content?: string; geo_feedback?: string
  eeat_experience?: string; eeat_expertise?: string; eeat_authority?: string; eeat_trust?: string
  external_url?: string; created_at: string; scheduled_at?: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-700 text-zinc-300", edited: "bg-blue-500/20 text-blue-400",
  approved: "bg-yellow-500/20 text-yellow-400", ready_to_publish: "bg-purple-500/20 text-purple-400",
  published: "bg-green-500/20 text-green-400", failed: "bg-red-900/30 text-red-300",
}
const STATUSES = ["draft","edited","approved","ready_to_publish","published","failed"]
const PLATFORMS = ["habr","vc","dzen"]
const PLATFORM_LABEL: Record<string, string> = { habr: "Habr", vc: "VC.ru", dzen: "Дзен" }

function GeoBar({ value, label }: { value: string | undefined; label: string }) {
  const n = parseFloat(value || "0")
  return (
    <div className="flex items-center gap-2">
      <span className="text-zinc-500 text-xs w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${n}%` }} />
      </div>
      <span className="text-xs text-zinc-400 w-8 text-right">{n.toFixed(0)}</span>
    </div>
  )
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("")
  const [selected, setSelected] = useState<Article | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [pubPlatforms, setPubPlatforms] = useState<string[]>([])
  const [pubResult, setPubResult] = useState<Record<string, unknown>[] | null>(null)

  const load = () => {
    const params: Record<string, string> = {}
    if (filterStatus) params.status = filterStatus
    if (filterPlatform) params.platform = filterPlatform
    articlesApi.list(params).then(setArticles).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatus, filterPlatform])

  const openArticle = async (a: Article) => {
    const full = await articlesApi.get(a.id)
    setSelected(full)
    setEditContent(full.content || "")
    setEditTitle(full.title || "")
    setEditStatus(full.status)
    setPubPlatforms([full.platform])
    setPubResult(null)
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    await articlesApi.update(selected.id, { title: editTitle, content: editContent, status: editStatus })
    setSaving(false)
    setSelected(null)
    load()
  }

  const publish = async () => {
    if (!selected) return
    setPublishing(true)
    setPubResult(null)
    try {
      const res = await publishApi.publish(selected.id, pubPlatforms)
      setPubResult(res.results)
      load()
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <div className="flex items-center gap-2 text-zinc-400"><Icon name="Loader2" size={16} className="animate-spin" /> Загрузка...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Статьи</h1>
          <p className="text-zinc-400 text-sm mt-1">{articles.length} статей</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterStatus || "all"} onValueChange={v => setFilterStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-40 h-8 text-sm"><SelectValue placeholder="Все статусы" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all" className="text-white">Все статусы</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPlatform || "all"} onValueChange={v => setFilterPlatform(v === "all" ? "" : v)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-36 h-8 text-sm"><SelectValue placeholder="Все площадки" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all" className="text-white">Все площадки</SelectItem>
              {PLATFORMS.map(p => <SelectItem key={p} value={p} className="text-white">{PLATFORM_LABEL[p]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {articles.length === 0 && <p className="text-zinc-500 text-sm py-8 text-center">Статей пока нет. Запустите генерацию из раздела Задания.</p>}

      <div className="space-y-2">
        {articles.map(a => {
          const rating = parseFloat(a.geo_rating || "0")
          return (
            <div key={a.id} onClick={() => openArticle(a)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`text-xs ${STATUS_COLORS[a.status] || ""}`}>{a.status}</Badge>
                    <Badge className="text-xs bg-zinc-800 text-zinc-400">{PLATFORM_LABEL[a.platform] || a.platform}</Badge>
                  </div>
                  <p className="text-white font-medium text-sm">{a.title || "Без заголовка"}</p>
                  <p className="text-zinc-500 text-xs mt-1">{new Date(a.created_at).toLocaleDateString("ru")}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${rating >= 85 ? "text-green-400" : rating >= 70 ? "text-yellow-400" : "text-red-400"}`}>{rating.toFixed(0)}</div>
                  <div className="text-xs text-zinc-500">GEO</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={v => { if (!v) setSelected(null) }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Редактор статьи</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div><Label className="text-zinc-300 text-sm">Заголовок</Label><Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white mt-1" /></div>
              <div>
                <Label className="text-zinc-300 text-sm">Статус</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {STATUSES.map(s => <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-zinc-300 text-sm">GEO-оценка</Label>
                  <span className={`text-sm font-bold ${parseFloat(selected.geo_rating || "0") >= 85 ? "text-green-400" : "text-yellow-400"}`}>
                    {parseFloat(selected.geo_rating || "0").toFixed(1)} / 100
                  </span>
                </div>
                <div className="space-y-1.5">
                  <GeoBar value={selected.eeat_experience} label="Опыт" />
                  <GeoBar value={selected.eeat_expertise} label="Экспертность" />
                  <GeoBar value={selected.eeat_authority} label="Авторитет" />
                  <GeoBar value={selected.eeat_trust} label="Доверие" />
                </div>
                {selected.geo_feedback && <p className="text-zinc-400 text-xs mt-2 italic">{selected.geo_feedback}</p>}
              </div>
              <div><Label className="text-zinc-300 text-sm">Контент (Markdown)</Label><Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white mt-1 min-h-64 font-mono text-xs" /></div>

              {/* Publish */}
              <div className="border-t border-zinc-800 pt-4">
                <Label className="text-zinc-300 text-sm mb-2 block">Опубликовать на площадках</Label>
                <div className="flex gap-2 mb-3">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setPubPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      className={`px-3 py-1 rounded-lg text-xs border transition-colors ${pubPlatforms.includes(p) ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-zinc-700 text-zinc-500 hover:text-white"}`}>
                      {PLATFORM_LABEL[p]}
                    </button>
                  ))}
                </div>
                {pubResult && (
                  <div className="space-y-1 mb-3">
                    {pubResult.map((r: Record<string, unknown>, i: number) => (
                      <div key={i} className={`text-xs p-2 rounded ${r.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {String(r.platform)}: {r.success ? `✓ ${String(r.external_url || "опубликовано")}` : `✗ ${String(r.error || "ошибка")}`}
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={publish} disabled={publishing || pubPlatforms.length === 0 || !["approved","ready_to_publish"].includes(editStatus)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm" size="sm">
                  {publishing ? <><Icon name="Loader2" size={14} className="animate-spin mr-1" />Публикую...</> : <><Icon name="Send" size={14} className="mr-1" />Опубликовать</>}
                </Button>
                {!["approved","ready_to_publish"].includes(editStatus) && <p className="text-zinc-500 text-xs mt-1 text-center">Переведите статью в статус approved или ready_to_publish</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelected(null)} className="text-zinc-400">Отмена</Button>
            <Button onClick={save} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white">
              {saving ? "Сохраняю..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
