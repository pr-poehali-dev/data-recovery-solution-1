import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Что такое GEO и чем оно отличается от SEO?",
      answer:
        "SEO оптимизирует сайт для поисковых систем (Google, Яндекс), чтобы получить клики. GEO (Generative Engine Optimization) оптимизирует контент для цитирования ИИ-ассистентами — ChatGPT, Perplexity, Claude. Цель не клик, а упоминание вашего бренда в ответе ИИ на вопрос потенциального клиента.",
    },
    {
      question: "Как работает автоматическое утверждение статей?",
      answer:
        "После генерации LLM оценивает статью по критериям E-E-A-T и выставляет GEO-рейтинг от 0 до 100. Если рейтинг ≥85 — статья автоматически переходит в статус approved и становится готова к публикации. Статьи с рейтингом ниже остаются на ручную проверку редактора.",
    },
    {
      question: "Реально ли публикуются статьи на Habr, Дзен и VC.ru?",
      answer:
        "По умолчанию система работает в mock-режиме: генерирует реальный контент, но публикует в «тестовую» среду, возвращая фиктивный external_id и URL. Для реальных публикаций достаточно добавить API-ключи площадок в настройках — код адаптеров полностью готов.",
    },
    {
      question: "Какую LLM использует система?",
      answer:
        "Система работает с любой LLM через стандартный API (OpenAI-совместимый). Вы передаёте свой LLM_API_KEY при развёртывании. По умолчанию поддерживаются GPT-4o и совместимые модели.",
    },
    {
      question: "Как запустить систему?",
      answer:
        "Достаточно одной команды: docker-compose up. В docker-compose включены FastAPI бэкенд, React фронтенд, PostgreSQL, Redis и MinIO. Первый администратор создаётся автоматически: admin@example.com / admin.",
    },
    {
      question: "Кто может работать в системе?",
      answer:
        "В системе две роли. Admin — полный доступ, включая управление API-ключами площадок и настройку шаблонов промптов. Editor — может редактировать статьи, утверждать и публиковать, но не имеет доступа к секретам и ключам.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Всё, что нужно знать о GeoContent Publisher перед запуском.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}