import React, {Component} from 'react';
import classes from 'classnames';
import {
  Row,
  Col
} from 'react-flexbox-grid';

import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import {
  ActionButton
} from './misc.jsx';

/**
 * ResourceEditor component
 */
@branch({
  cursors: {
    blfModal: ['states', 'res', 'blfModal'],
    lang: ['lang']
  }
})
export default class BlfModal extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
  };

  render() {
    const closeBlf = () => {
      this.context.tree.emit('blfModal:dismiss', {model: 'res'})
    }
    return (
      <div className="full-height stretched-column">
        <h1 className="centered stretched-row">
          <span style={{flex: 1}}>{this.props.lang === 'fr' ? 'éditeur de références' : 'references editor'}</span>
          <ActionButton 
            label="X" 
            action={closeBlf}
          />
        </h1>
        <iframe src="http://localhost:9000/" style={{flex: 1}} />
      </div>
    );
  }
}