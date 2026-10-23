// Android/iOS: muat TTF statis per ketebalan (nama keluarga dipakai di tema.js).
import { useFonts } from 'expo-font';
import { Karla_400Regular } from '@expo-google-fonts/karla/400Regular';
import { Karla_600SemiBold } from '@expo-google-fonts/karla/600SemiBold';
import { Karla_700Bold } from '@expo-google-fonts/karla/700Bold';
import { Karla_800ExtraBold } from '@expo-google-fonts/karla/800ExtraBold';
import { PatuaOne_400Regular } from '@expo-google-fonts/patua-one/400Regular';

export function useFontKos() {
  const [siap, galat] = useFonts({
    Karla400: Karla_400Regular,
    Karla600: Karla_600SemiBold,
    Karla700: Karla_700Bold,
    Karla800: Karla_800ExtraBold,
    PatuaOne: PatuaOne_400Regular,
  });
  return siap || !!galat;
}
