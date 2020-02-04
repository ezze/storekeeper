import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'mobx-react';

import './index.sass';

import { createStores } from './store';

import App from './components/App';

document.addEventListener('DOMContentLoaded', async() => {
  const { generalStore } = await createStores();

  const content = (
    <Provider generalStore={generalStore}>
      <Router>
        <App />
      </Router>
    </Provider>
  );

  render(content, document.getElementById('container'));
});
