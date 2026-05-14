import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import { settingsApi } from "@/lib/api"
import { getUser } from "@/lib/auth"

interface PlatformSetting { id: string; platform: string; is_mock: string; extra_config: string }
interface PromptTemplate { id: string; name: string; platform: string; template: string; is_active: string }

const PLATFORM_LABEL: Record<string, string> = { habr: "Habr", vc: "VC.ru", dzen: "Дзен" }

export default function Settings() {
  const user = getUser()
  const isAdmin = user?.role === "admin"

  const [platforms, setPlatforms] = useState<PlatformSetting[]>([])
  const [appSettings, setAppSettings] = useState<Record<string, string>>({})
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")

  useEffect(() => {
    settingsApi.platforms().then(setPlatforms)
    settingsApi.appSettings().then(setAppSettings)
    settingsApi.promptTemplates().then(setPrompts)
  }, [])

  const saveAppSettings = async () => {
    setSaving(true)
    await settingsApi.updateAppSettings(appSettings)
    setSaving(false)
    setSavedMsg("Сохранено!")
    setTimeout(() => setSavedMsg(""), 2000)
  }

  const toggleMock = async (platform: string, isMock: boolean) => {
    await settingsApi.updatePlatform(platform, { is_mock: isMock })
    setPlatforms(prev => prev.map(p => p.platform === platform ? { ...p, is_mock: String(isMock) } : p))
  }

  const savePrompt = async (tmpl: PromptTemplate, newTemplate: string) => {
    await settingsApi.updatePromptTemplate(tmpl.id, { template: newTemplate })
    setPrompts(prev => prev.map(p => p.id === tmpl.id ? { ...p, template: newTemplate } : p))
    setSavedMsg("Промпт сохранён!")
    setTimeout(() => setSavedMsg(""), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="text-zinc-400 text-sm mt-1">Площадки, промпты, параметры системы</p>
      </div>

      {savedMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
          <Icon name="CheckCircle2" size={14} /> {savedMsg}
        </div>
      )}

      <Tabs defaultValue="platforms">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="platforms" className="data-[state=active]:bg-zinc-700 text-zinc-400 data-[state=active]:text-white">Площадки</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-zinc-700 text-zinc-400 data-[state=active]:text-white">Система</TabsTrigger>
          <TabsTrigger value="prompts" className="data-[state=active]:bg-zinc-700 text-zinc-400 data-[state=active]:text-white">Промпты</TabsTrigger>
        </TabsList>

        {/* Platforms */}
        <TabsContent value="platforms" className="space-y-3 mt-4">
          {platforms.map(p => (
            <Card key={p.platform} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-white text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Globe" size={16} className="text-blue-400" />
                    {PLATFORM_LABEL[p.platform] || p.platform}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${p.is_mock === "true" ? "text-yellow-400" : "text-green-400"}`}>
                      {p.is_mock === "true" ? "Mock-режим" : "Боевой"}
                    </span>
                    {isAdmin && (
                      <Switch
                        checked={p.is_mock === "true"}
                        onCheckedChange={v => toggleMock(p.platform, v)}
                      />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-zinc-500 text-xs">
                  {p.is_mock === "true"
                    ? "Публикует в тестовую среду, возвращает fake external_id и URL. Контент генерируется реальный."
                    : "Публикует на реальную площадку через API. Убедитесь, что API-ключи настроены."}
                </p>
                {!isAdmin && <p className="text-zinc-600 text-xs mt-1">Только администратор может менять режим</p>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* System settings */}
        <TabsContent value="system" className="space-y-4 mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3"><CardTitle className="text-white text-base">Параметры системы</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300 text-sm">Порог авто-утверждения (GEO-рейтинг)</Label>
                <Input
                  type="number" min="0" max="100"
                  value={appSettings.auto_approve_threshold || "85"}
                  onChange={e => setAppSettings({ ...appSettings, auto_approve_threshold: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1 w-32"
                  disabled={!isAdmin}
                />
                <p className="text-zinc-500 text-xs mt-1">Статьи с рейтингом ≥ этого значения автоматически переходят в статус approved</p>
              </div>
              <div>
                <Label className="text-zinc-300 text-sm">Модель LLM</Label>
                <Input
                  value={appSettings.llm_model || "gpt-4o"}
                  onChange={e => setAppSettings({ ...appSettings, llm_model: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1 w-48"
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-sm flex items-center gap-2">
                  Опрос дашборда
                  {isAdmin && (
                    <Switch
                      checked={appSettings.dashboard_poll_enabled === "true"}
                      onCheckedChange={v => setAppSettings({ ...appSettings, dashboard_poll_enabled: String(v) })}
                    />
                  )}
                </Label>
              </div>
              <div>
                <Label className="text-zinc-300 text-sm">Интервал опроса (сек)</Label>
                <Input
                  type="number"
                  value={appSettings.dashboard_poll_interval || "300"}
                  onChange={e => setAppSettings({ ...appSettings, dashboard_poll_interval: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1 w-32"
                  disabled={!isAdmin}
                />
              </div>
              {isAdmin && (
                <Button onClick={saveAppSettings} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white">
                  {saving ? "Сохраняю..." : "Сохранить"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts */}
        <TabsContent value="prompts" className="space-y-3 mt-4">
          {prompts.length === 0 && <p className="text-zinc-500 text-sm">Шаблонов промптов нет</p>}
          {prompts.map(tmpl => (
            <PromptEditor key={tmpl.id} tmpl={tmpl} isAdmin={isAdmin} onSave={savePrompt} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PromptEditor({ tmpl, isAdmin, onSave }: { tmpl: PromptTemplate; isAdmin: boolean; onSave: (t: PromptTemplate, v: string) => void }) {
  const [value, setValue] = useState(tmpl.template)
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); await onSave(tmpl, value); setSaving(false) }
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-white text-sm">{tmpl.name}</CardTitle></CardHeader>
      <CardContent className="px-4 pb-4">
        <Textarea value={value} onChange={e => setValue(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white text-xs font-mono min-h-40" disabled={!isAdmin} />
        {isAdmin && <Button size="sm" onClick={save} disabled={saving} className="mt-2 bg-red-500 hover:bg-red-600 text-white">{saving ? "..." : "Сохранить"}</Button>}
      </CardContent>
    </Card>
  )
}
