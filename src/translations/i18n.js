import i18next from 'i18next';

import languages from './languages';

let i18n;

export async function getI18n(defaultLanguageId) {
  try {
    if (i18n) {
      return i18n;
    }

    const fallbackLanguage = languages[0].id;

    await i18next.init({
      whitelist: languages.map(language => language.id),
      lng: defaultLanguageId || fallbackLanguage,
      fallbackLng: fallbackLanguage,
      lowerCaseLng: true,
      react: {
        wait: true,
        nsMode: 'fallback'
      },
      debug: false,
      resources: {},
      interpolation: {
        escapeValue: false
      }
    });

    i18n = i18next;

    languages.forEach(language => {
      const { id, resources } = language;
      const namespaces = Object.keys(resources);
      namespaces.forEach(namespace => {
        const resourceBundle = resources[namespace];
        i18n.addResourceBundle(id, namespace, resourceBundle);
      });
    });

    return i18n;
  }
  catch (e) {
    console.error(e);
    return Promise.reject('Unable to initialize i18n.');
  }
}
