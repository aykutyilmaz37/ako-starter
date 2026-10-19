import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';
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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <List
          dataSource={items}
          rowKey="title"
          split={false}
          grid={{ columns: { base: 1, md: 3 }, gap: 'lg' }}
          renderItem={({ icon: Icon, title, text }) => (
            <ListItem>
              <ListItemMeta
                avatar={
                  <span className="flex size-11 items-center justify-center rounded-mari-full bg-mari-primary-subtle text-mari-primary-subtle-contrast">
                    <Icon size={20} aria-hidden />
                  </span>
                }
                title={title}
                description={text}
              />
            </ListItem>
          )}
        />
      </div>
    </section>
  );
}
