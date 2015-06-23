/**
 * AIME-admin Misc Components
 * ===========================
 *
 */
import React from 'react';
import classes from 'classnames';
import PureComponent from '../lib/pure.js';
import Col from 'react-bootstrap/lib/Col';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';

/**
 * Box generic component
 */
export class Box extends PureComponent {
  render() {
    return (
      <div className={classes({box: true, selected: this.props.selected})}
           onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  };
};

/**
 * Button generic component
 */
export class ActionButton extends PureComponent {
  render() {
    let {
      size,
      action = () => console.log(this.props.label,"pressed"),
      state='normal',
      label,
      loadingLabel
    } = this.props;

    const classString = `button col-md-12`;

    if (state === 'saving')
      label = loadingLabel;

    return (
      <button className={classString} onClick={action}>{label}</button>
    );
  };
};

/**
 * Toolbar
 */
@branch({
  cursors: {
    lang: ['lang']
  }
})
export class Toolbar extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {
    const lang = this.props.lang;

    const changeView = () => {
      this.context.tree.emit('view:change', 'home');
    };

    const changeLang = () => {
      this.context.tree.emit('lang:change', lang === 'en' ? 'fr' : 'en');
    };

    return (
        <div className="col-md-1" id="toolbar">
          <button type="button" className="btn btn-default" aria-label="Left Align" onClick={changeView}>
            <span className="glyphicon glyphicon-home" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-default" aria-label="Left Align" onClick={changeLang}>
            {lang.toUpperCase()}
          </button>
          <button type="button" className="btn btn-default" aria-label="Left Align">
            <span className="glyphicon glyphicon-user" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-default" aria-label="Left Align">
            <span className="glyphicon glyphicon-off" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-default" aria-label="Left Align">
            <span className="glyphicon glyphicon-option-horizontal" aria-hidden="true" />
          </button>
      </div>
    );
  };
};
