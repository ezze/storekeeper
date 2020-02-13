import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import NavbarLanguageDropdownItem from './NavbarLanguageDropdownItem';

import languages from '../translations/languages';

class NavbarLanguageDropdown extends Component {
  static propTypes = {
    dropdownId: PropTypes.string,
    setDropdownId: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.setDropdownId('language');
  }

  render() {
    const { t, dropdownId } = this.props;
    const className = classNames('navbar-item', 'has-dropdown', {
      'is-active': dropdownId === 'language'
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
