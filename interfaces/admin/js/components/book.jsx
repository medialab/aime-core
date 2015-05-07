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
import classes from 'classnames';

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
          <ChapterList />
        </Col>
        <Col md={4} />
      </Row>
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
class ChapterList extends PureComponent {
  renderChapter(chapter) {
    return <Chapter key={chapter.id} chapter={chapter} />;
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
 * A chapter
 */
class Chapter extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {collapsed: true};
  }

  handleClick() {
    this.setState({collapsed: !this.state.collapsed});
  }

  render() {
    const chapter = this.props.chapter;

    return (
      <li onClick={this.handleClick.bind(this)}>
        <div className="chapter-box">
          <span>{chapter.display_number}</span>
          {' ' + chapter.title}
        </div>
        <SubheadingList subheadings={chapter.children} visible={!this.state.collapsed} />
      </li>
    );
  }
}

/**
 * List displaying a chapter's subheading
 */
class SubheadingList extends PureComponent {
  renderSubheading(subheading) {
    return <Subheading key={subheading.id} subheading={subheading} />;
  }

  render() {
    const {subheadings, visible} = this.props;

    return (
      <ul className={classes({hidden: !visible})}>
        {subheadings.map(this.renderSubheading)}
      </ul>
    );
  }
}

/**
 * A subheading
 */
class Subheading extends PureComponent {
  render() {
    const {subheading} = this.props;

    return (
      <li>
        <div className="subheading-box">
          {subheading.title}
        </div>
      </li>
    );
  }
}
