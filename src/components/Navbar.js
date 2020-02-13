import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { REQUEST_BROWSE_LEVEL_PACK } from '../constants/request';
import { withEventBus } from '../context/eventBus';

import NavbarLevelsDropdown from './NavbarLevelsDropdown';
import NavbarLanguageDropdown from './NavbarLanguageDropdown';

class Navbar extends Component {
  static propTypes = {
    eventBus: PropTypes.object.isRequired
  };

  state = {
    dropdownId: null
  };

  constructor(props) {
    super(props);
    this.setDropdownId = this.setDropdownId.bind(this);
    this.onOpenClick = this.onOpenClick.bind(this);
  }

  setDropdownId(dropdownId) {
    this.setState({ dropdownId: this.state.dropdownId === dropdownId ? null : dropdownId });
  }

  onOpenClick() {
    const { eventBus } = this.props;
    eventBus.request(REQUEST_BROWSE_LEVEL_PACK);
  }

  render() {
    const { dropdownId } = this.state;
    return (
      <nav className="navbar is-danger" role="navigation">
        <div className="navbar-brand">
          <div className="navbar-item">
            Storekeeper
          </div>
          <a className="navbar-burger burger" role="menu" data-target="navigation">
            <span />
            <span />
            <span />
          </a>
        </div>
        <div id="navigation" className="navbar-menu">
          <div className="navbar-start">
          </div>
          <div className="navbar-end">
            <NavbarLevelsDropdown dropdownId={dropdownId} setDropdownId={this.setDropdownId} />
            <NavbarLanguageDropdown dropdownId={dropdownId} setDropdownId={this.setDropdownId} />
          </div>
        </div>
      </nav>
    );
  }
}

export default withEventBus(Navbar);
