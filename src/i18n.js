import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome to my app!",
          language: "Change Language",
        },
      },
      fr: {
        translation: {
          welcome: "Bienvenue dans mon application !",
          language: "Changer de langue",
        },
      },
    },
    lng: "fr", // Set French as the default language
    fallbackLng: "fr", // Use French if no translation is found
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
