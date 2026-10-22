// Android/iOS: muat TTF statis per ketebalan (nama keluarga dipakai di tema.js).
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { YoungSerif_400Regular } from '@expo-google-fonts/young-serif/400Regular';

export function useFontKos() {
  const [siap, galat] = useFonts({
    Jakarta400: PlusJakartaSans_400Regular,
    Jakarta600: PlusJakartaSans_600SemiBold,
    Jakarta700: PlusJakartaSans_700Bold,
    Jakarta800: PlusJakartaSans_800ExtraBold,
    YoungSerif: YoungSerif_400Regular,
  });
  return siap || !!galat;
}
