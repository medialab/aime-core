/**
 * AIME-admin Misc Components
 * ===========================
 *
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import classes from 'classnames';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {Editor, Preview} from './editor.jsx';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import autobind from 'autobind-decorator';

/**
 * List layout generic component
 */
@branch({
  cursors(props) {
    const model = props.model;

    return {
      data: ['data', model],
      selection: ['states', model, 'selection']
    };
  }
})
export class ListLayout extends PureComponent {
  static childContextTypes = {
    model: React.PropTypes.string
  };

  getChildContext() {
    return {
      model: this.props.model
    };
  }

  @autobind
  renderEditor(visible) {
    if (!visible)
      return <Col md={4} />;

    return (
      <Col md={4} className="full-height">
        <h1>Editor</h1>
        <div className="overflowing">
          <Editor model={this.props.model}
                  buffer={this.props.buffer} />
        </div>
      </Col>
    );
  }

  @autobind
  renderPreview(visible) {
    if (!visible)
      return <Col md={4} />;

    return (
      <Col md={4} className="full-height">
        <h1>Preview</h1>
        <div className="overflowing">
          <Preview model={this.props.model}
                   buffer={this.props.buffer} />
        </div>
      </Col>
    );
  }

  render() {
    const isSomethingSelected = (this.props.selection || []).length > (1 - (this.props.model === 'doc')),
          isThereAnyData = !!this.props.data;

    return (
      <Row className="full-height">
        <Col className={classes({hidden: isThereAnyData && isSomethingSelected})} md={4} />
        <Col md={4} id="middle" className="full-height">
          <h1>{this.props.title}</h1>
          <div className="overflowing">
            <List items={this.props.data}
                  selection={this.props.selection || []} />
          </div>
        </Col>
        {this.renderEditor(isThereAnyData && isSomethingSelected)}
        {this.renderPreview(isThereAnyData && isSomethingSelected)}
      </Row>
    );
  }
}

/**
 * List generic component
 */
class List extends PureComponent {

  @autobind
  renderItem(item) {
    return <Item key={item.id}
                 item={item}
                 selection={this.props.selection}
                 active={this.props.selection[0] === item.id} />;
  }

  render() {
    const items = this.props.items;

    if (!items)
      return <div>...</div>;
    else
      return <ul>{items.map(this.renderItem)}</ul>;
  }
}

/**
 * A generic list item
 */
class Item extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.context.model,
      level: 0,
      target: this.props.item.id
    });
  }

  render() {
    const item = this.props.item;

    return (
      <li>
        <div className={classes('chapter-box', {active: this.props.active})}
             onClick={this.handleClick}>
          {item.title}
        </div>
        {this.context.model === 'book' &&
          <SubList items={item.children}
                   selection={this.props.selection.slice(1)}
                   visible={this.props.active} />}
      </li>
    );
  }
}

/**
 * Sublist generic component
 */
class SubList extends PureComponent {

  @autobind
  renderItem(item) {
    return <SubItem key={item.id}
                    item={item}
                    selection={this.props.selection.slice(1)}
                    active={this.props.selection[0] === item.id} />;
  }

  render() {
    const {items, visible} = this.props;

    return (
      <ul className={classes({hidden: !visible, 'sub-list': true})}>
        {items.map(this.renderItem)}
      </ul>
    );
  }
}

/**
 * A generic sublist item
 */
class SubItem extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.context.model,
      level: 1,
      target: this.props.item.id
    });
  }

  render() {
    const item = this.props.item,
          title = this.context.model === 'doc' ?
            'slide' :
            item.title;

    return (
      <li>
        <div className={classes('subheading-box', {active: this.props.active})}
             onClick={this.handleClick}>
          {title}
        </div>
        {this.props.active ?
          <ThumbnailList items={item.children}
                         selection={this.props.selection} /> :
          null}
      </li>
    );
  }
}

/**
 * Thumbnail list component
 */
class ThumbnailList extends PureComponent {

  @autobind
  renderThumbnail(item, index) {
    return <Thumbnail key={index}
                      index={index}
                      item={item}
                      active={this.props.selection[0] === index} />;
  }

  render() {
    return (
      <ul className="sub-list">
        {this.props.items.map(this.renderThumbnail)}
      </ul>
    );
  }
}

/**
 * Thumbnail generic component
 */
class Thumbnail extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.context.model,
      level: 2,
      target: this.props.index
    });
  }

  render() {
    const {active, index, item: {text}} = this.props;

    return (
      <li>
        <div className="thumbnail-box">
          <table>
            <tr>
              <td className="thumbnail-index">{index}</td>
              <td className={classes('thumbnail-text', {active: active})}
                  onClick={this.handleClick}>
                {text}
              </td>
            </tr>
          </table>
        </div>
      </li>
    );
  }
}
