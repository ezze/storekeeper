import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import 'bootstrap';

@inject('generalStore') @observer
class Navbar extends Component {
  static propTypes = {
    generalStore: PropTypes.any.isRequired
  };

  constructor() {
    super();
    this._id = Math.round(Math.random() * 10000);
  }

  render() {
    const { generalStore } = this.props;
    const { levelNumber, movesCount, pushesCount, boxesCount, retractedBoxesCount } = generalStore;

    return (
      <nav id={`navbar-${this._id}`} className="navbar navbar-expand-lg navbar-dark bg-primary">
        <a className="navbar-brand" href="/">Storekeeper</a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target={`#navbar-${this._id} .navbar-collapse`}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" href="/">Home</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                Levels
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">Open... <small>Ctrl+O</small></a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">Level 1</a>
                <a className="dropdown-item" href="#">Level 2</a>
                <a className="dropdown-item" href="#">Level 3</a>
              </div>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <span className="navbar-text"><strong>Level</strong> {levelNumber}</span>
            </li>
            <li className="nav-item">
              <span className="navbar-text"><strong>Moves</strong> {movesCount}</span>
            </li>
            <li className="nav-item">
              <span className="navbar-text"><strong>Pushes</strong> {pushesCount}</span>
            </li>
            <li className="nav-item">
              <span className="navbar-text"><strong>Boxes</strong> {retractedBoxesCount} / {boxesCount}</span>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
