import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { reaction } from 'mobx';
import { Provider } from 'mobx-react';
import { I18nextProvider } from 'react-i18next';
import { Provider as EventBusProvider } from './context/eventBus';

import './index.sass';

import eventBus from './eventBus';
import { createStores } from './store';
import { getI18n } from './translations/i18n';

import App from './components/App';

document.addEventListener('DOMContentLoaded', async() => {
  const { gameStore } = await createStores();
  const i18n = await getI18n(gameStore.languageId);

  reaction(() => gameStore.languageId, languageId => {
    i18n.changeLanguage(languageId);
  });

  const content = (
    <Provider gameStore={gameStore}>
      <I18nextProvider i18n={i18n}>
        <EventBusProvider value={eventBus}>
          <Router>
            <App />
          </Router>
        </EventBusProvider>
      </I18nextProvider>
    </Provider>
  );

  render(content, document.getElementById('container'));
});
