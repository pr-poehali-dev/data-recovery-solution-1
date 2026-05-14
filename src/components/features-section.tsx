import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import Icon from "@/components/ui/icon"

const features = [
  {
    title: "GEO-оптимизация статей",
    description: "LLM генерирует статьи по GEO-принципам: прямой ответ в первом абзаце, FAQ-блок, структурированные данные — всё, чтобы вас цитировали ИИ-ассистенты.",
    icon: "Sparkles",
    badge: "AI",
  },
  {
    title: "GEO-рейтинг 0–100",
    description: "Каждая статья автоматически оценивается по E-E-A-T критериям. Рейтинг ≥85 — публикация одобряется без участия редактора.",
    icon: "BarChart3",
    badge: "Авто",
  },
  {
    title: "3 площадки одновременно",
    description: "Habr, Дзен, VC.ru — адаптированный контент под стиль каждой платформы. Mock-режим для тестирования без реальных публикаций.",
    icon: "Globe",
    badge: "Мульти",
  },
  {
    title: "Очередь и планировщик",
    description: "Redis-очередь с умным расписанием публикаций. Визуальный календарь, массовые операции, retry при ошибках до 5 попыток.",
    icon: "CalendarClock",
    badge: "Smart",
  },
  {
    title: "Веб-редактор",
    description: "Markdown/WYSIWYG-редактор для правки статей на любом этапе. Статусы: draft → edited → approved → ready_to_publish.",
    icon: "FileEdit",
    badge: "Editor",
  },
  {
    title: "Дашборд GEO-метрик",
    description: "Цитируемость, доля голоса, тональность — мониторинг того, как часто вас упоминают ChatGPT, Perplexity и другие LLM.",
    icon: "TrendingUp",
    badge: "Analytics",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Всё для роста цитируемости в ИИ</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            GeoContent Publisher автоматизирует весь цикл: от задания до публикации на трёх площадках
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon name={feature.icon} size={28} className="text-red-500" fallback="Star" />
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}