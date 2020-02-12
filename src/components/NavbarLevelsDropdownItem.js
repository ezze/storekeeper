import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

@inject('gameStore') @observer
class NavbarLevelsDropdownItem extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { gameStore, fileName } = this.props;
    gameStore.setLevelPackFileName(fileName);
  }

  render() {
    const { gameStore, fileName, label } = this.props;
    const { levelPackFileName } = gameStore;
    const className = classNames('navbar-item', {
      'is-active': fileName === levelPackFileName
    });

    return (
      <a className={className} onClick={this.onClick}>
        {label}
      </a>
    );
  }
}

export default NavbarLevelsDropdownItem;
