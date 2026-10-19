import { Platform } from 'react-native';

// iOS simülatörü makinenin localhost'una doğrudan erişir; Android emülatörü 10.0.2.2 ister.
const devHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost}:5165`;
