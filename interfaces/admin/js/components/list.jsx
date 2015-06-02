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
    const isSomethingSelected = (this.props.selection || []).length > 1,
          isThereAnyData = !!this.props.data;

    // TODO: full height
    return (
      <Row className="full-height">
        <Col className={classes({hidden: isThereAnyData && isSomethingSelected})} md={4} />
        <Col md={4} id="middle" className="full-height">
          <h1>{this.props.title}</h1>
          <div className="overflowing">
            <List model={this.props.model}
                  items={this.props.data}
                  selection={this.props.selection} />
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
                 model={this.props.model}
                 selection={this.props.selection}
                 active={(this.props.selection || [])[0] === item.id} />;
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
    tree: PropTypes.baobab
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.props.model,
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
        <SubList items={item.children}
                 model={this.props.model}
                 selection={this.props.selection}
                 visible={this.props.active} />
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
                    model={this.props.model}
                    active={(this.props.selection || [])[1] === item.id} />;
  }

  render() {
    const {items, visible} = this.props;

    return (
      <ul className={classes({hidden: !visible})}>
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
    tree: PropTypes.baobab
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.props.model,
      level: 1,
      target: this.props.item.id
    });
  }

  render() {
    const item = this.props.item,
          title = this.props.model === 'documents' ?
            'slide' :
            item.title;

    return (
      <li>
        <div className={classes('subheading-box', {active: this.props.active})}
             onClick={this.handleClick}>
          {title}
        </div>
      </li>
    );
  }
}
