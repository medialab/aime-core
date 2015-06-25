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
      loadingLabel,
      disabledLabel
    } = this.props;

    const classString = classes('button', 'col-md-12', {disabled: state === 'disabled'});

    if (state === 'saving')
      label = loadingLabel;
    else if (state === 'disabled')
      label = disabledLabel;

    return (
      <button className={classString}
              onClick={e => {e.preventDefault(); action(e);}}
              disabled={state === 'disabled'}>
        {label}
      </button>
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

    const logout = () => {
      this.context.tree.emit('logout');
    };

    return (
        <div className="col-md-1" id="toolbar">
          <button type="button" className="btn btn-default" aria-label="Left Align" onClick={changeView}>
            <span className="glyphicon glyphicon-home" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-default" aria-label="Left Align" onClick={changeLang}>
            {lang.toUpperCase()}
          </button>
          <button type="button" className="btn btn-default" aria-label="Left Align" onClick={logout}>
            <span className="glyphicon glyphicon-off" aria-hidden="true" />
          </button>
      </div>
    );
  };
};

/**
 * Resource icon component
 */
export class ResourceIcon extends PureComponent {
  render() {
    return <span className={classes('glyphicon', this.props.kind)}
                 aria-hidden="true" />;
  }
}
