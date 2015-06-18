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
  }
}

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

    const classString = `box bouton centered`;

    if (state === 'saving')
      label = loadingLabel;

    return (
      <Col md={size} className={classString} onClick={action}>{label}</Col>
    );
  };
}

/**
 * toolbar
 */
export class Toolbar extends PureComponent {

  static contextTypes = {
    tree: PropTypes.baobab
  };
  
  render() {
    const changeView = () => {
            this.context.tree.emit('view:change', 'home');
          }
    return (
      <div className="col-md-1" id="toolbar">
        <h1>?</h1>
        <hr/>
        <ActionButton label="H" action={changeView} />
      </div>
    );
  };
}