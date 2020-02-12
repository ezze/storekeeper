import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { REQUEST_BROWSE_LEVEL_PACK } from '../constants/request';
import { withEventBus } from '../context/eventBus';

import NavbarLanguageDropdown from './NavbarLanguageDropdown';

class Navbar extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired,
    eventBus: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.onOpenClick = this.onOpenClick.bind(this);
  }

  onOpenClick() {
    const { eventBus } = this.props;
    eventBus.request(REQUEST_BROWSE_LEVEL_PACK);
  }

  render() {
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
            <NavbarLanguageDropdown />
            <a className="navbar-item">

            </a>
          </div>
        </div>
      </nav>
    );
  }
}

export default withEventBus(Navbar);
