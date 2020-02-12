import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

@inject('gameStore') @observer
class LevelStats extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired
  };

  render() {
    const { t, gameStore } = this.props;
    const { levelNumber, movesCount, pushesCount, boxesCount, retractedBoxesCount } = gameStore;
    return levelNumber > 0 ? (
      <div className="level-stats">
        <div className="level-stats-item">
          {t('moves', { count: movesCount })}
        </div>
        <div className="level-stats-item">
          {t('pushes', { count: pushesCount })}
        </div>
        <div className="level-stats-item">
          {t('boxes', { count: boxesCount, retractedCount: retractedBoxesCount })}
        </div>
      </div>
    ) : '';
  }
}

export default withTranslation('level')(LevelStats);
