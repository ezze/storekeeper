import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';

import NavbarLanguageDropdownItem from './NavbarLanguageDropdownItem';

import languages from '../translations/languages';

class NavbarLanguageDropdown extends Component {
  state = {
    open: false
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.toggle();
  }

  toggle() {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  render() {
    const { t } = this.props;
    const { open } = this.state;
    const className = classNames('navbar-item', 'has-dropdown', {
      'is-active': open
    });
    return (
      <div className={className} role="menu" onClick={this.onClick}>
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
