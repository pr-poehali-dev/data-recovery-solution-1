import { Timeline } from "@/components/ui/timeline"

export function ApplicationsTimeline() {
  const data = [
    {
      title: "Шаг 1: Задание из дашборда",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Система автоматически опрашивает аналитический дашборд и получает задания: тема, угол подачи,
            ключевые сущности бренда, целевая тональность и приоритет публикации.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Фильтр заданий по приоритету: high / medium
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Автосохранение в базу с topic_id и suggested_keywords
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Уведомление дашборда после публикации (webhook/лог)
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Шаг 2: Генерация и оценка",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            LLM генерирует статью 800–1500 слов с GEO-структурой: прямой ответ в первом абзаце, H2/H3,
            таблицы, FAQ, конкретные цифры и ссылки. Затем та же LLM оценивает E-E-A-T и выставляет GEO-рейтинг.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              GEO-рейтинг 0–100 по критериям E-E-A-T
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Автоутверждение при рейтинге ≥85 без редактора
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Проверка уникальности через pgvector-эмбеддинги
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Шаг 3: Публикация на площадках",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Статья адаптируется под формат каждой платформы и публикуется через единый интерфейс.
            Mock-режим позволяет тестировать без реальных публикаций — готов к переключению на боевые API.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Habr, Дзен, VC.ru — три адаптера из коробки
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Календарь публикаций с массовыми операциями
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Retry при ошибках до 5 попыток через Redis-очередь
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="applications" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">Как работает GeoContent Publisher</h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Три шага от задания до публикации — полностью автоматически. Редактор подключается только там, где нужен человеческий взгляд.
          </p>
        </div>

        <div className="relative">
          <Timeline data={data} />
        </div>
      </div>
    </section>
  )
}