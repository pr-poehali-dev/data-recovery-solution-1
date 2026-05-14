import Icon from "@/components/ui/icon"

const stats = [
  {
    value: "+340%",
    label: "рост упоминаний в ИИ",
    description: "среднее по клиентам за 3 месяца",
    icon: "TrendingUp",
  },
  {
    value: "800–1500",
    label: "слов в каждой статье",
    description: "оптимальный объём для GEO-цитируемости",
    icon: "FileText",
  },
  {
    value: "3",
    label: "площадки одновременно",
    description: "Habr, Дзен и VC.ru из коробки",
    icon: "Globe",
  },
  {
    value: "≤40 мин",
    label: "от задания до публикации",
    description: "без участия редактора при рейтинге ≥85",
    icon: "Zap",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-black border-y border-red-500/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 mb-4 group-hover:bg-red-500/20 transition-colors duration-300">
                <Icon name={stat.icon} size={26} className="text-red-500" fallback="Star" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white font-orbitron mb-2 leading-none">
                {stat.value}
              </div>
              <div className="text-red-400 font-semibold text-base mb-1">{stat.label}</div>
              <div className="text-gray-500 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
