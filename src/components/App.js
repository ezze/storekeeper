import React, { Component } from 'react';

import Navbar from './Navbar';
import GameContent from './GameContent';
import OptionsModal from './OptionsModal';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Navbar />
        <GameContent />
        <OptionsModal />
      </div>
    );
  }
}

export default App;
