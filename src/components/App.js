import React, { Component } from 'react';

import Navbar from './Navbar';
import GameContent from './GameContent';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Navbar />
        <GameContent />
      </div>
    );
  }
}

export default App;
