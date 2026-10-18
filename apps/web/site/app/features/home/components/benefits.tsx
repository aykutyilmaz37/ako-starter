import { BookOpen, Flame, Truck } from 'lucide-react';

const items = [
  {
    icon: Flame,
    title: 'Haftada iki kez kavurma',
    text: 'Pazartesi ve perşembe kavurur, aynı gün paketleriz.',
  },
  {
    icon: Truck,
    title: '750 ₺ üzeri ücretsiz kargo',
    text: 'İstanbul içi ertesi gün, diğer şehirlere 2 iş günü.',
  },
  {
    icon: BookOpen,
    title: 'Her pakette demleme rehberi',
    text: 'Oran, öğütme ve süre: o kahve için denediğimiz tarif.',
  },
];

export function Benefits() {
  return (
    <section aria-label="Neden Akı" className="border-y border-mari-border">
      <ul className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-mari-full bg-mari-primary-subtle text-mari-primary-subtle-contrast">
              <Icon size={20} aria-hidden />
            </span>
            <div>
              <h2 className="font-sans text-base font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-mari-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
