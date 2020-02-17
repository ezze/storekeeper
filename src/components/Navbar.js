import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { withEventBus } from '../context/eventBus';

import NavbarLevelsDropdown from './NavbarLevelsDropdown';
import NavbarLanguageDropdown from './NavbarLanguageDropdown';

class Navbar extends Component {
  static propTypes = {
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

  render() {
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
            <NavbarLanguageDropdown
              dropdownId={dropdownId}
              setMenuOpen={this.setMenuOpen}
              setDropdownId={this.setDropdownId}
            />
            <NavbarLevelsDropdown
              dropdownId={dropdownId}
              setMenuOpen={this.setMenuOpen}
              setDropdownId={this.setDropdownId}
            />
          </div>
        </div>
      </nav>
    );
  }
}

export default withEventBus(Navbar);
