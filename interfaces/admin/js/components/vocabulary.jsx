/**
 * AIME-admin Vocabulary Component
 * ================================
 *
 * Component dealing with the vocabulary model's view.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {Editor, Preview} from './editor.jsx';
import {branch} from 'baobab-react/decorators';
import classes from 'classnames';

/**
 * Main component
 */
@branch({
  cursors: {
    data: ['data', 'vocabulary'],
    selected: ['states', 'book', 'selected']
  }
})
export default class Vocabulary extends PureComponent {
  render() {
    const isSomethingSelected = !!this.props.selected,
          isThereAnyData = !!this.props.data;

    return (
      <Row className="full-height">
        <Col className={classes({hidden: isThereAnyData && isSomethingSelected})} md={4} />
        <Col md={4} id="middle">
          <h1>Vocabulary</h1>
          <div />
        </Col>
        <Col md={4}>
          {isThereAnyData && isSomethingSelected ?
            <Editor buffer={this.props.buffer} /> :
            <div />}
        </Col>
        <Col md={4}>
          {isThereAnyData && isSomethingSelected ?
            <Preview buffer={this.props.buffer} /> :
            <div />}
        </Col>
      </Row>
    );
  }
}
