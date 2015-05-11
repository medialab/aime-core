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
import {Editor, Preview} from './editor.jsx';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import classes from 'classnames';

/**
 * Main component
 */
@branch({
  cursors: {
    data: ['data', 'book'],
    selected: ['states', 'book', 'selected', 'subheading']
  }
})
export default class Book extends PureComponent {
  render() {
    const isSomethingSelected = !!this.props.selected,
          isThereAnyData = !!this.props.data;

    return (
      <Row className="full-height">
        <Col className={classes({hidden: isThereAnyData && isSomethingSelected})} md={4} />
        <Col md={4} id="middle">
          <h1>The Book</h1>
          <ChapterList />
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

/**
 * List displaying the book elements
 */
@branch({
  cursors: {
    chapters: ['data', 'book'],
    selected: ['states', 'book', 'selected', 'chapter']
  }
})
class ChapterList extends PureComponent {
  renderChapter(chapter) {
    return <Chapter key={chapter.id}
                    chapter={chapter}
                    active={this.props.selected === chapter.id} />;
  }

  render() {
    const chapters = this.props.chapters;

    if (!chapters)
      return <div>...</div>;
    else
      return <ul>{this.props.chapters.map(this.renderChapter.bind(this))}</ul>;
  }
}

/**
 * A chapter
 */
class Chapter extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  handleClick() {
    this.context.tree.emit('chapter:select', this.props.chapter.id);
  }

  render() {
    const chapter = this.props.chapter;

    return (
      <li>
        <div className={classes('chapter-box', {active: this.props.active})}
             onClick={this.handleClick.bind(this)}>
          <span>{chapter.display_number}</span>
          {' ' + chapter.title}
        </div>
        <SubheadingList subheadings={chapter.children} visible={this.props.active} />
      </li>
    );
  }
}

/**
 * List displaying a chapter's subheading
 */
@branch({
  cursors: {
    selected: ['states', 'book', 'selected', 'subheading']
  }
})
class SubheadingList extends PureComponent {
  renderSubheading(subheading) {
    return <Subheading key={subheading.id}
                       subheading={subheading}
                       active={this.props.selected === subheading.id} />;
  }

  render() {
    const {subheadings, visible} = this.props;

    return (
      <ul className={classes({hidden: !visible})}>
        {subheadings.map(this.renderSubheading.bind(this))}
      </ul>
    );
  }
}

/**
 * A subheading
 */
class Subheading extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  handleClick() {
    this.context.tree.emit('subheading:select', this.props.subheading.id);
  }

  render() {
    const {subheading} = this.props;

    return (
      <li>
        <div className={classes('subheading-box', {active: this.props.active})}
             onClick={this.handleClick.bind(this)}>
          {subheading.title}
        </div>
      </li>
    );
  }
}
