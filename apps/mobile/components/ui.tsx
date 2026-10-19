import { Text, useTheme } from '@mari-ui/native';
import type { ReactNode } from 'react';
import { Text as RNText, View, type TextStyle } from 'react-native';
import { FONT_HEADING } from '~/lib/brand';

/** Başlıklar web'deki gibi Playfair Display serif. mari-ui Title sistem fontunu kullandığı için kendi Text'imiz. */
export function Heading({
  children,
  size = 28,
  style,
}: {
  children: ReactNode;
  size?: number;
  style?: TextStyle;
}) {
  const { color } = useTheme();
  return (
    <RNText
      accessibilityRole="header"
      style={[
        {
          fontFamily: FONT_HEADING,
          fontSize: size,
          lineHeight: Math.round(size * 1.2),
          color: color.canvas.foreground,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

/** Başlığın üstündeki küçük büyük harfli etiket ("TADIM MASASINDAN"). */
export function Eyebrow({ children }: { children: ReactNode }) {
  const { color } = useTheme();
  return (
    <RNText
      style={{
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.6,
        color: color.accent.text,
      }}
    >
      {String(children).toLocaleUpperCase('tr-TR')}
    </RNText>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View style={{ gap: 4, flexShrink: 1 }}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading size={24}>{title}</Heading>
      </View>
      {action}
    </View>
  );
}

export function Muted({ children, size = 14 }: { children: ReactNode; size?: number }) {
  return (
    <Text style={{ fontSize: size, lineHeight: Math.round(size * 1.5) }} muted>
      {children}
    </Text>
  );
}
