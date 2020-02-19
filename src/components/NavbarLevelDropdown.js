import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

@inject('gameStore') @observer
class NavbarLevelDropdown extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired,
    dropdownId: PropTypes.string,
    setMenuOpen: PropTypes.func.isRequired,
    setDropdownId: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onPreviousClick = this.onPreviousClick.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.onRestartClick = this.onRestartClick.bind(this);
    this.onOpenClick = this.onOpenClick.bind(this);

    this.buttons = [{
      id: 'level.previous',
      onClick: this.onPreviousClick,
      keys: 'Alt+Z'
    }, {
      id: 'level.next',
      onClick: this.onNextClick,
      keys: 'Alt+X'
    }, {
      id: 'level.restart',
      onClick: this.onRestartClick,
      keys: 'Alt+R'
    }, {
      id: 'divider'
    }, {
      id: 'level.open',
      onClick: this.onOpenClick,
      keys: 'Ctrl+O'
    }];
  }

  onClick(event) {
    if (event.target.parentElement.getAttribute('role') === 'menu') {
      this.props.setDropdownId('level');
    }
    else {
      this.props.setMenuOpen(false);
    }
  }

  onPreviousClick() {
    const { gameStore, setMenuOpen } = this.props;
    setMenuOpen(false);
    gameStore.game.levelPack.previous();
  }

  onNextClick() {
    const { gameStore, setMenuOpen } = this.props;
    setMenuOpen(false);
    gameStore.game.levelPack.next();
  }

  onRestartClick() {
    const { gameStore, setMenuOpen } = this.props;
    setMenuOpen(false);
    gameStore.game.levelPack.restart();
  }

  onOpenClick() {
    const { gameStore, setMenuOpen } = this.props;
    setMenuOpen(false);
    gameStore.game.browseLevelPack();
  }

  render() {
    const { t, dropdownId } = this.props;
    const className = classNames('navbar-item', 'has-dropdown', {
      'is-active': dropdownId === 'level'
    });
    return (
      <div className={className} role="menu" onClick={this.onClick}>
        <a className="navbar-link">{t('level.label')}</a>
        <div className="navbar-dropdown is-right">
          {this.buttons.map((button, i) => {
            if (button.id === 'divider') {
              return (
                <hr key={`divider-${i}`} className="navbar-divider" />
              );
            }
            return (
              <a key={button.id} className="navbar-item" onClick={button.onClick}>
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      {t(button.id)}
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item"></div>
                    <div className="level-item">
                      <small>{button.keys}</small>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    );
  }
}

export default withTranslation('navbar')(NavbarLevelDropdown);
