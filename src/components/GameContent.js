import React, { Component } from 'react';

import Game from '../game/Game';
import InvaderRenderer from '../game/renderer/InvaderRenderer';

class GameContent extends Component {
  contentRef = React.createRef();

  componentDidMount() {
    new Game({
      renderer: new InvaderRenderer({
        container: this.contentRef.current
      }),
      levelPack: 'levels/original.json'
    });
  }

  render() {
    return (
      <div ref={this.contentRef} className="content"></div>
    );
  }
}

export default GameContent;
