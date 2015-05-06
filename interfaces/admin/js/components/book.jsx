/**
 * AIME-admin Book Component
 * ==========================
 *
 * Component dealing with the book model's view.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {Box} from './misc.jsx';
import {branch} from 'baobab-react/decorators';

/**
 * A chapter
 */
class Chapter extends PureComponent {
  render() {
    return (
      <Box>{this.props.title}</Box>
    );
  }
}

/**
 * List displaying the book elements
 */
@branch({
  cursors: {
    chapters: ['data', 'book']
  }
})
class List extends PureComponent {
  renderChapter(chapter) {
    return (
      <li key={chapter.id} className="spaced">
        <Chapter title={chapter.title} />
      </li>
    );
  }

  render() {
    const chapters = this.props.chapters;

    if (!chapters)
      return <div>...</div>;
    else
      return <ul>{this.props.chapters.map(this.renderChapter)}</ul>;
  }
}

/**
 * Main component
 */
export default class Book extends PureComponent {
  render() {
    return (
      <Row>
        <Col md={4} />
        <Col md={4} id="middle">
          <h1>The Book</h1>
          <List />
        </Col>
        <Col md={4} />
      </Row>
    );
  }
}
