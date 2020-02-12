import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { levelPacks } from '../constants/level';

import NavbarLevelsDropdownItem from './NavbarLevelsDropdownItem';

@inject('gameStore') @observer
class NavbarLevelsDropdown extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired
  };

  state = {
    open: false
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onOpenClick = this.onOpenClick.bind(this);
  }

  onClick() {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  onOpenClick() {
    const { gameStore } = this.props;
    gameStore.game.browseLevelPack();
  }

  render() {
    const { t } = this.props;
    const { open } = this.state;
    const className = classNames('navbar-item', 'has-dropdown', {
      'is-active': open
    });
    return (
      <div className={className} role="menu" onClick={this.onClick}>
        <a className="navbar-link">{t('levels')}</a>
        <div className="navbar-dropdown">
          <a className="navbar-item" onClick={this.onOpenClick}>
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  {t('open')}
                </div>
              </div>
              <div className="level-right">
                <div className="level-item"></div>
                <div className="level-item">
                  <small>Ctrl+O</small>
                </div>
              </div>
            </div>
          </a>
          <hr className="navbar-divider" />
          {levelPacks.map(levelPack => (
            <NavbarLevelsDropdownItem key={levelPack.id} {...levelPack} />
          ))}
        </div>
      </div>
    );
  }
}

export default withTranslation('navbar')(NavbarLevelsDropdown);
