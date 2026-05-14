import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import { tasksApi, articlesApi } from "@/lib/api"
import { getUser } from "@/lib/auth"

interface Task {
  id: string; theme: string; required_angle: string; key_entities: string
  priority: string; status: string; source: string; created_at: string
  target_tone: string; suggested_keywords: string
}

const PRIORITY_COLORS: Record<string, string> = { high: "bg-red-500/20 text-red-400", medium: "bg-yellow-500/20 text-yellow-400", low: "bg-zinc-700 text-zinc-400" }
const STATUS_COLORS: Record<string, string> = { new: "bg-blue-500/20 text-blue-400", generating: "bg-purple-500/20 text-purple-400", done: "bg-green-500/20 text-green-400", failed: "bg-red-900/40 text-red-300" }
const PLATFORMS = ["habr", "vc", "dzen"]

export default function Tasks() {
  const user = getUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [generateId, setGenerateId] = useState<string | null>(null)
  const [genPlatform, setGenPlatform] = useState("habr")
  const [genLoading, setGenLoading] = useState(false)
  const [genResult, setGenResult] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState({ theme: "", required_angle: "", key_entities: "", priority: "medium", target_tone: "экспертный", suggested_keywords: "" })

  const load = () => tasksApi.list().then(setTasks).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const pollDashboard = async () => {
    setPolling(true)
    try { await tasksApi.pollDashboard(); await load() }
    finally { setPolling(false) }
  }

  const createTask = async () => {
    if (!form.theme.trim()) return
    await tasksApi.create(form)
    setCreateOpen(false)
    setForm({ theme: "", required_angle: "", key_entities: "", priority: "medium", target_tone: "экспертный", suggested_keywords: "" })
    load()
  }

  const generate = async () => {
    if (!generateId) return
    setGenLoading(true)
    setGenResult(null)
    try {
      const res = await articlesApi.generate(generateId, genPlatform)
      setGenResult(res)
      load()
    } catch (e: unknown) {
      const err = e as { message?: string }
      setGenResult({ error: err?.message || "Ошибка генерации" })
    } finally {
      setGenLoading(false)
    }
  }

  if (loading) return <div className="flex items-center gap-2 text-zinc-400"><Icon name="Loader2" size={16} className="animate-spin" /> Загрузка...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Задания</h1>
          <p className="text-zinc-400 text-sm mt-1">{tasks.length} заданий</p>
        </div>
        <div className="flex gap-2">
          {user?.role === "admin" && (
            <Button variant="outline" size="sm" onClick={pollDashboard} disabled={polling} className="border-zinc-700 text-zinc-300 hover:text-white">
              <Icon name={polling ? "Loader2" : "RefreshCw"} size={14} className={`mr-1 ${polling ? "animate-spin" : ""}`} />
              Опросить дашборд
            </Button>
          )}
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-red-500 hover:bg-red-600 text-white">
            <Icon name="Plus" size={14} className="mr-1" /> Новое задание
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-zinc-500 text-sm py-8 text-center">Заданий пока нет. Создайте первое или опросите дашборд.</p>}
        {tasks.map(task => (
          <Card key={task.id} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`text-xs ${PRIORITY_COLORS[task.priority] || ""}`}>{task.priority}</Badge>
                    <Badge className={`text-xs ${STATUS_COLORS[task.status] || "bg-zinc-700 text-zinc-400"}`}>{task.status}</Badge>
                    {task.source === "dashboard" && <Badge className="text-xs bg-blue-500/20 text-blue-400">дашборд</Badge>}
                  </div>
                  <p className="text-white font-medium text-sm truncate">{task.theme}</p>
                  {task.required_angle && <p className="text-zinc-500 text-xs mt-0.5 truncate">Угол: {task.required_angle}</p>}
                  {task.suggested_keywords && <p className="text-zinc-600 text-xs mt-0.5 truncate">Ключи: {task.suggested_keywords}</p>}
                </div>
                <Button
                  size="sm"
                  disabled={task.status === "generating"}
                  onClick={() => { setGenerateId(task.id); setGenResult(null) }}
                  className="shrink-0 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30"
                >
                  <Icon name="Zap" size={14} className="mr-1" />
                  Генерировать
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader><DialogTitle>Новое задание</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-zinc-300 text-sm">Тема *</Label><Input value={form.theme} onChange={e => setForm({...form, theme: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white mt-1" placeholder="Как GEO увеличивает цитируемость..." /></div>
            <div><Label className="text-zinc-300 text-sm">Угол подачи</Label><Input value={form.required_angle} onChange={e => setForm({...form, required_angle: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white mt-1" placeholder="практические советы" /></div>
            <div><Label className="text-zinc-300 text-sm">Ключевые сущности бренда</Label><Input value={form.key_entities} onChange={e => setForm({...form, key_entities: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white mt-1" placeholder="GeoContent Publisher" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-300 text-sm">Приоритет</Label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="high" className="text-white">Высокий</SelectItem>
                    <SelectItem value="medium" className="text-white">Средний</SelectItem>
                    <SelectItem value="low" className="text-white">Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-zinc-300 text-sm">Тональность</Label><Input value={form.target_tone} onChange={e => setForm({...form, target_tone: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white mt-1" /></div>
            </div>
            <div><Label className="text-zinc-300 text-sm">Ключевые слова</Label><Input value={form.suggested_keywords} onChange={e => setForm({...form, suggested_keywords: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white mt-1" placeholder="GEO, LLM, цитируемость" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="text-zinc-400">Отмена</Button>
            <Button onClick={createTask} className="bg-red-500 hover:bg-red-600 text-white">Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate dialog */}
      <Dialog open={!!generateId} onOpenChange={v => { if (!v) { setGenerateId(null); setGenResult(null) } }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Icon name="Zap" size={16} className="text-red-500" />Запустить генерацию</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-zinc-300 text-sm">Площадка</Label>
              <Select value={genPlatform} onValueChange={setGenPlatform}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {PLATFORMS.map(p => <SelectItem key={p} value={p} className="text-white capitalize">{p === "vc" ? "VC.ru" : p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {genResult && (
              <div className={`p-3 rounded-lg text-sm ${genResult.error ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                {genResult.error ? String(genResult.error) : (
                  <div className="space-y-1">
                    <p className="font-semibold">✓ Статья сгенерирована!</p>
                    <p>GEO-рейтинг: <strong>{String(genResult.geo_rating)}</strong></p>
                    <p>Статус: <strong>{String(genResult.status)}{genResult.auto_approved ? " (авто-утверждена)" : ""}</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setGenerateId(null); setGenResult(null) }} className="text-zinc-400">Закрыть</Button>
            <Button onClick={generate} disabled={genLoading} className="bg-red-500 hover:bg-red-600 text-white">
              {genLoading ? <><Icon name="Loader2" size={14} className="animate-spin mr-1" />Генерирую...</> : "Запустить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
