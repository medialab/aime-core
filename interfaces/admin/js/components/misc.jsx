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
    const {size, action = () => console.log(this.props.label,"pressed") , state='default-state', label} = this.props;
    const classString = `box bouton centered ${state}`;

    return (
      <Col md={size} className={classString} onClick={action}>{label}</Col>
    );
  };
}