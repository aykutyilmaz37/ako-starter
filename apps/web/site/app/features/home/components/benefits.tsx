import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';
import { BookOpen, Flame, Truck } from 'lucide-react';
import { useT } from '~/shared/i18n/i18n-provider';

export function Benefits() {
  const t = useT();
  const items = [
    {
      icon: Flame,
      title: t('home.benefits.roast.title'),
      text: t('home.benefits.roast.text'),
    },
    {
      icon: Truck,
      title: t('home.benefits.shipping.title'),
      text: t('home.benefits.shipping.text'),
    },
    {
      icon: BookOpen,
      title: t('home.benefits.guide.title'),
      text: t('home.benefits.guide.text'),
    },
  ];

  return (
    <section aria-label={t('home.benefits.label')} className="border-y border-mari-border">
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
