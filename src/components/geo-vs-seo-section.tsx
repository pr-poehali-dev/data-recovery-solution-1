import Icon from "@/components/ui/icon"

const rows = [
  {
    criterion: "Цель",
    seo: "Попасть в топ Google / Яндекс",
    geo: "Быть процитированным в ответе ИИ",
  },
  {
    criterion: "Результат",
    seo: "Клик на сайт",
    geo: "Упоминание бренда без клика",
  },
  {
    criterion: "Структура текста",
    seo: "Ключевые слова, заголовки H1–H6",
    geo: "Прямой ответ в первом абзаце + FAQ",
  },
  {
    criterion: "Критерии качества",
    seo: "PageRank, ссылочная масса",
    geo: "E-E-A-T: опыт, экспертиза, авторитет",
  },
  {
    criterion: "Где работает",
    seo: "Поисковая выдача",
    geo: "ChatGPT, Perplexity, Claude, Gemini",
  },
  {
    criterion: "Скорость результата",
    seo: "3–12 месяцев",
    geo: "2–4 недели после публикации",
  },
  {
    criterion: "Автоматизация",
    seo: "Частичная (подбор ключей, meta)",
    geo: "Полная: генерация → оценка → публикация",
  },
]

export function GeoVsSeoSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">
            SEO vs <span className="text-red-500">GEO</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Поисковая оптимизация и оптимизация для генеративных движков — разные игры с разными правилами
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground w-[22%]">Критерий</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground w-[39%]">
                  <div className="flex items-center gap-2">
                    <Icon name="Search" size={16} className="text-muted-foreground" />
                    SEO
                  </div>
                </th>
                <th className="text-left px-6 py-4 font-semibold text-red-400 w-[39%]">
                  <div className="flex items-center gap-2">
                    <Icon name="Sparkles" size={16} className="text-red-500" />
                    GEO (GeoContent Publisher)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-muted/20 ${
                    index % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-foreground">{row.criterion}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.seo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-red-500 mt-0.5 shrink-0" fallback="Check" />
                      <span className="text-foreground">{row.geo}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
