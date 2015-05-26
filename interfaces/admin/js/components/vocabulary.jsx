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
    buffer: ['states', 'vocabulary', 'editor'],
    selected: ['states', 'vocabulary', 'selected']
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
          <VocabularyList vocabulary={this.props.data} />
        </Col>
        <Col md={4}>
          {isThereAnyData && isSomethingSelected && this.props.buffer ?
            <Editor path={['states', 'book', 'editor']} buffer={this.props.buffer} /> :
            <div />}
        </Col>
        <Col md={4}>
          {isThereAnyData && isSomethingSelected && this.props.buffer  ?
            <Preview buffer={this.props.buffer} /> :
            <div />}
        </Col>
      </Row>
    );
  }
}

/**
 * List displaying the different vocabulary items
 */
@branch({
  cursors: {
    selected: ['states', 'vocabulary', 'selected']
  }
})
class VocabularyList extends PureComponent {
  renderItem(item) {
    return <VocabularyItem key={item.id}
                           item={item}
                           active={this.props.selected === item.id} />;
  }

  render() {
    const vocabulary = this.props.vocabulary;

    if (!vocabulary)
      return <div>...</div>;
    else
      return <ul>{vocabulary.map(this.renderItem.bind(this))}</ul>;
  }
}

/**
 * Vocabulary item
 */
class VocabularyItem extends PureComponent {
  handleClick() {
    console.log('clicked');
  }

  render() {
    const item = this.props.item;

    return (
      <li>
        <div className={classes('chapter-box', {active: this.props.active})}
             onClick={this.handleClick.bind(this)}>
          {item.title}
        </div>
      </li>
    );
  }
}
