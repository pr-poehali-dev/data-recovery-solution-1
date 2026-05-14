import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Алексей Воронов",
    role: "Head of Marketing, TechScale",
    avatar: "/cybersecurity-expert-man.jpg",
    content:
      "Через месяц после старта Perplexity начал цитировать наши статьи в 3 из 5 запросов по нашей нише. GEO-рейтинг у большинства статей — выше 88.",
  },
  {
    name: "Марина Соколова",
    role: "Контент-директор, B2B SaaS платформа",
    avatar: "/professional-woman-scientist.png",
    content:
      "Раньше мы тратили 3 дня на одну статью. Теперь от задания до публикации на Хабре — 40 минут. И качество выше, чем у людей.",
  },
  {
    name: "Дмитрий Ли",
    role: "CMO, e-commerce холдинг",
    avatar: "/asian-woman-tech-developer.jpg",
    content:
      "ChatGPT и Claude стали упоминать наш бренд в ответах на вопросы о продукте. Это совершенно новый канал трафика, которого раньше не существовало.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-sans">Результаты клиентов</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Бренды, которые уже получают трафик из ответов ChatGPT, Perplexity и Claude
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <p className="text-card-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}