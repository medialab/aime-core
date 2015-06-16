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
import {ActionButton} from './misc.jsx';
import {Modal} from './modal.jsx';

/**
 * List layout generic component
 */
@branch({
  cursors(props) {
    const model = props.model;

    return {
      data: ['data', model],
      modal: ['states', model, 'modal'],
      selection: ['states', model, 'selection']
    };
  }
})
export class ListLayout extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

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

    const model = this.props.model,
          save = () => {
            this.context.tree.emit('element:save', {model: model});
          };
    if (!visible)
      return <Col md={4} />;
    return (
      <Col md={4} id="editor" className="full-height">
        <h1 className="centered">Editor</h1>
        <div className="overflowing">
          <Editor model={this.props.model}
                  buffer={this.props.buffer} />
        </div>
        <div className="actions"> 
          {(model === 'book') &&  <ActionButton size={12} label="add item"/>}
          <ActionButton size={12} action={save} label="save"/>
        </div>
      </Col>
    );
  }

  @autobind
  renderPreview(visible) {
    if (!visible)
      return <Col md={4} />;

    return (
      <Col md={4} id="preview" className="full-height">
        <h1 className="centered">Preview</h1>
        <div className="overflowing">
          <Preview model={this.props.model}
                   buffer={this.props.buffer} />
        </div>
      </Col>

    );
  }

  @autobind
  renderModal(visible){

    var titles = {"doc":"Create document"};
    
    if (!!visible)
      return (
        <Col md={4}>
          <Modal title={titles[this.props.model]}/>
        </Col>
      );
  }

  render() {
    const model = this.props.model,
          isSomethingSelected = (this.props.selection || []).length > (1 - (model === 'doc')),
          isThereAnyData = !!this.props.data;


    const open = () => {
      this.context.tree.emit('modal:open', {model: this.props.model, type: 'creation'});
    };

    return (
      <Row className="full-height">
        <Col className={classes({hidden: isThereAnyData && isSomethingSelected})} md={4} />
        <Col md={4} id="book" className="full-height">
          <h1 className="centered">{this.props.title }</h1>
          <div className="overflowing">
            <List items={this.props.data}
                  selection={this.props.selection || []} />
            {(model === 'book') &&  <ActionButton size={12} label="add chapter"/>}
          </div>
          {(model === 'doc') &&  <ActionButton size={12} action={open} label="add document"/>}
        </Col>

        {this.renderModal(this.props.modal)}
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
        <div className={classes('box', 'chapter', {selected: this.props.active})}
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
        <div className={classes('box', 'subheading', {selected: this.props.active})}
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
              <td className={classes('thumbnail-text box', {selected: active})}
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
