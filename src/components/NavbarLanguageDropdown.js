import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import NavbarLanguageDropdownItem from './NavbarLanguageDropdownItem';

import languages from '../translations/languages';

@inject('gameStore') @observer
class NavbarLanguageDropdown extends Component {
  state = {
    open: false
  };

  static propTypes = {
    gameStore: PropTypes.any.isRequired
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onClick() {
    this.toggle();
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.toggle();
    }
  }

  toggle() {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  render() {
    const { t } = this.props;
    const { open } = this.state;
    const dropdownClassName = classNames('navbar-item', 'has-dropdown', {
      'is-active': open
    });
    return (
      <div
        className={dropdownClassName}
        role="menu"
        tabIndex="0"
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
      >
        <a className="navbar-link">{t('language')}</a>
        <div className="navbar-dropdown">
          {languages.map(language => (
            <NavbarLanguageDropdownItem key={language.id} {...language} />
          ))}
        </div>
      </div>
    );
  }
}

export default withTranslation('navbar')(NavbarLanguageDropdown);
