import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';

import eventBus from '../eventBus';
import Game from '../game/Game';
import InvaderRenderer from '../game/renderer/InvaderRenderer';

@inject('generalStore') @observer
class GameContent extends Component {
  static propTypes = {
    generalStore: PropTypes.any.isRequired
  };

  contentRef = React.createRef();

  componentDidMount() {
    const { generalStore } = this.props;
    generalStore.game = new Game({
      eventBus,
      renderer: new InvaderRenderer({
        eventBus,
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
