import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';

import eventBus from '../eventBus';
import Game from '../game/Game';
import InvaderRenderer from '../game/renderer/InvaderRenderer';

import LevelInfo from './LevelInfo';
import LevelStats from './LevelStats';

@inject('gameStore') @observer
class GameContent extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired
  };

  gameContainerRef = React.createRef();

  componentDidMount() {
    const { gameStore } = this.props;
    gameStore.game = new Game({
      eventBus,
      renderer: new InvaderRenderer({
        eventBus,
        container: this.gameContainerRef.current
      }),
      levelPack: 'levels/original.json'
    });
  }

  render() {
    return (
      <div className="game">
        <div className="game-container" ref={this.gameContainerRef}></div>
        <LevelInfo />
        <LevelStats />
      </div>
    );
  }
}

export default GameContent;
