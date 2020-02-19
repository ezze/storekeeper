import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import languages from '../translations/languages';
import { levelPacks } from '../constants/level';

@inject('gameStore') @observer
class OptionsModal extends Component {
  static propTypes = {
    gameStore: PropTypes.any.isRequired
  };

  constructor(props) {
    super(props);
    this.onLanguageChange = this.onLanguageChange.bind(this);
    this.onLevelPackChange = this.onLevelPackChange.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);
  }

  onLanguageChange(event) {
    const { gameStore } = this.props;
    gameStore.setLanguageId(event.target.value);
  }

  onLevelPackChange(event) {
    const { gameStore } = this.props;
    gameStore.setLevelPackFileName(event.target.value);
  }

  onCloseClick() {
    const { gameStore } = this.props;
    gameStore.setModal(null);
  }

  render() {
    const { t, gameStore } = this.props;
    const { modal, languageId, levelPackFileName } = gameStore;
    const className = classNames('modal', { 'is-active': modal === 'options' });
    return (
      <div className={className}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{t('title')}</p>
            <button className="delete" onClick={this.onCloseClick}></button>
          </header>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">{t('language.label')}</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select value={languageId} onChange={this.onLanguageChange}>
                    {languages.map(language => (
                      <option key={language.id} value={language.id}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="field">
              <label className="label">{t('level-pack.label')}</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select value={levelPackFileName} onChange={this.onLevelPackChange}>
                    {levelPacks.map(levelPack => (
                      <option key={levelPack.id} value={levelPack.fileName}>
                        {levelPack.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <div></div>
            <div>
              <button className="button" onClick={this.onCloseClick}>{t('close')}</button>
            </div>
          </footer>
        </div>
      </div>
    );
  }
}

export default withTranslation('options')(OptionsModal);
