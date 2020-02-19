import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { withEventBus } from '../context/eventBus';

import NavbarLevelsDropdown from './NavbarLevelDropdown';

@inject('gameStore') @observer
class Navbar extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired,
    eventBus: PropTypes.object.isRequired
  };

  state = {
    menuOpen: false,
    dropdownId: null
  };

  constructor(props) {
    super(props);
    this.setMenuOpen = this.setMenuOpen.bind(this);
    this.setDropdownId = this.setDropdownId.bind(this);
    this.onBurgerClick = this.onBurgerClick.bind(this);
    this.onOptionsClick = this.onOptionsClick.bind(this);
  }

  setMenuOpen(menuOpen) {
    if (menuOpen) {
      this.setState({ menuOpen });
    }
    else {
      this.setState({ menuOpen: false, dropdownId: null });
    }
  }

  setDropdownId(dropdownId) {
    this.setState({ dropdownId: this.state.dropdownId === dropdownId ? null : dropdownId });
  }

  onBurgerClick() {
    this.setMenuOpen(!this.state.menuOpen);
  }

  onOptionsClick() {
    const { gameStore } = this.props;
    this.setMenuOpen(false);
    gameStore.setModal('options');
  }

  render() {
    const { t } = this.props;
    const { menuOpen, dropdownId } = this.state;
    const burgerClassName = classNames('navbar-burger', { 'is-active': menuOpen });
    const menuClassName = classNames('navbar-menu', { 'is-active': menuOpen });
    return (
      <nav className="navbar is-danger" role="navigation">
        <div className="navbar-brand">
          <div className="navbar-item">
            Storekeeper
          </div>
          <a className={burgerClassName} role="menu" data-target="navigation" onClick={this.onBurgerClick}>
            <span />
            <span />
            <span />
          </a>
        </div>
        <div id="navigation" className={menuClassName}>
          <div className="navbar-start">
          </div>
          <div className="navbar-end">
            <NavbarLevelsDropdown
              dropdownId={dropdownId}
              setMenuOpen={this.setMenuOpen}
              setDropdownId={this.setDropdownId}
            />
            <a className="navbar-item" onClick={this.onOptionsClick}>
              <i className="fas fa-cog"></i> {t('options.label')}
            </a>
          </div>
        </div>
      </nav>
    );
  }
}

export default withTranslation('navbar')(withEventBus(Navbar));
