import { SOCIAL_BRANDS } from '@ako/shared';
import { Text } from '@mari-ui/native/typography';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RADIUS } from '~/shared/lib/brand';
import { useThemePreference } from '~/features/theme/theme-preference';

/** Sağlayıcının kendi markasıyla (ikon + renk) sosyal giriş düğmesi. */
export function SocialButton({
  provider,
  label,
  loading,
  disabled,
  onPress,
}: {
  provider: string;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { scheme } = useThemePreference();
  const brand = SOCIAL_BRANDS[provider];
  if (!brand) return null;

  const colors = (scheme === 'dark' && brand.dark) || brand;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        opacity: disabled && !loading ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={colors.foreground} />
      ) : (
        <Svg width={20} height={20} viewBox={brand.viewBox}>
          {brand.paths.map((path) => (
            <Path key={path.d} d={path.d} fill={path.fill ?? colors.foreground} />
          ))}
        </Svg>
      )}
      <View>
        <Text weight="semibold" style={{ color: colors.foreground }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
