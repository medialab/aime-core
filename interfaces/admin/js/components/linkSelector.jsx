/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import {
  Row,
  Col
} from 'react-flexbox-grid';

import {ActionButton} from './misc.jsx';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import autobind from 'autobind-decorator';
import {ResourceIcon} from './misc.jsx';
import {resourceName} from '../lib/helpers.js';

/**
 * Book Link Selector
 */
export class BookLinkSelector extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor (props,context) {
    super(props,context);

    this.state = {};
  }

  render() {
    const dismiss = () => {
      this.context.tree.emit('linkSelector:dismiss');
    };

    const lang = this.context.tree.get('lang');

    return (
      <Row className="full-height stretched-column">
        <h1>Link the book</h1>
        <div className="buttons-row">
          <ActionButton size={6} action={dismiss} label="close"/>
        </div>
      </Row>
    );
  }
}

/**
 * Voc Link Selector
 */
export class VocLinkSelector extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor (props,context) {
    super(props,context);

    this.state = {};
  }

  render() {
    const dismiss = () => {
      this.context.tree.emit('linkSelector:dismiss');
    };

    const lang = this.context.tree.get('lang');

    return (
      <Row className="full-height stretched-column">
        <h1>Link the voc</h1>
        <div className="buttons-row">
          <ActionButton size={6} action={dismiss} label="close"/>
        </div>
      </Row>
    );
  }
}
