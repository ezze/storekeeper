import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { Provider as EventBusProvider } from './context/eventBus';

import './index.sass';

import eventBus from './eventBus';

import { createStores } from './store';

import App from './components/App';

document.addEventListener('DOMContentLoaded', async() => {
  const { generalStore } = await createStores();

  const content = (
    <Provider generalStore={generalStore}>
      <EventBusProvider value={eventBus}>
        <Router>
          <App />
        </Router>
      </EventBusProvider>
    </Provider>
  );

  render(content, document.getElementById('container'));
});
