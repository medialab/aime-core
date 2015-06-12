/**
 * AIME-admin Misc Components
 * ===========================
 *
 */
import React from 'react';
import classes from 'classnames';
import PureComponent from '../lib/pure.js';
import Col from 'react-bootstrap/lib/Col';

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
  render(){
    const {size, action = () => console.log(this.props.label,"pressed") , type='default', label} = this.props;
    const classString = `box bouton centered ${type}`;

    return (
      <Col md={size} className={classString} onClick={action}>{label}</Col>
    );
  };
}