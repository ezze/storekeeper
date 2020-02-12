import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

@inject('gameStore') @observer
class NavbarLanguageDropdownItem extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onClick() {
    this.changeLanguage();
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.changeLanguage();
    }
  }

  changeLanguage() {
    const { gameStore, id } = this.props;
    gameStore.setLanguageId(id);
  }

  render() {
    const { gameStore, id, label } = this.props;
    const { languageId } = gameStore;
    const className = classNames('navbar-item', {
      'is-active': id === languageId
    });
    return (
      <a
        key={id}
        className={className}
        role="menuitem"
        tabIndex="0"
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
      >
        {label}
      </a>
    );
  }
}

export default NavbarLanguageDropdownItem;
