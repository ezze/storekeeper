import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

@inject('gameStore') @observer
class LevelInfo extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired
  };

  render() {
    const { t, gameStore } = this.props;
    const { levelNumber } = gameStore;
    return levelNumber > 0 ? (
      <div className="level-info">
        {t('number', { number: levelNumber })}
      </div>
    ) : '';
  }
}

export default withTranslation('level')(LevelInfo);
