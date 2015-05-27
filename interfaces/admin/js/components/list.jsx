/**
 * AIME-admin Misc Components
 * ===========================
 *
 */
import React, {Component} from 'react';
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

// TODO: render more cleverly concerning buffer here?
// TODO: the editor itself and the preview should be cursored, not this comp
@branch({
  cursors(props) {
    const model = props.model;

    return {
      data: ['data', model],
      buffer: ['states', model, 'editor'],
      selection: ['states', model, 'selection']
    };
  }
})
export class ListLayout extends Component {
  render() {
    console.log('render');
    const isSomethingSelected = !!this.props.selection && this.props.selection.length > 1,
          isThereAnyData = !!this.props.data;

    return (
      <Row className="full-height">
        <Col className={classes({hidden: isThereAnyData && isSomethingSelected})} md={4} />
        <Col md={4} id="middle">
          <h1>{this.props.title}</h1>
          <List model={this.props.model}
                items={this.props.data}
                selection={this.props.selection} />
        </Col>
        <Col md={4}>
          {isThereAnyData && isSomethingSelected && this.props.buffer ?
            <Editor model={this.props.model}
                    buffer={this.props.buffer} /> :
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
 * List generic component
 */
class List extends Component {

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
class Item extends Component {
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
class SubList extends Component {

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
class SubItem extends Component {
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
    const item = this.props.item;

    return (
      <li>
        <div className={classes('subheading-box', {active: this.props.active})}
             onClick={this.handleClick}>
          {item.title}
        </div>
      </li>
    );
  }
}
