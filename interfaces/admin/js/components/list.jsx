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

const MODAL_TITLES = {
  doc: 'create document'
};

/**
 * Layout component
 */
@branch({
  cursors(props) {
    const model = props.model;

    return {
      data: ['data', model],
      modal: ['states', model, 'modal'],
      selection: ['states', model, 'selection'],
      saving: ['states', model, 'saving']
    };
  }
})
export class Layout extends PureComponent {
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

  render() {
    const model = this.props.model,
          isAModalDisplayed = !!this.props.modal,
          isSomethingSelected = (this.props.selection || []).length > (1 - (model === 'doc')),
          isThereAnyData = !!this.props.data,
          editionMode = isSomethingSelected && isThereAnyData && !isAModalDisplayed;

    // Actions
    const open = () => {
      this.context.tree.emit('modal:open', {
        model: model,
        type: 'creation'
      });
    };

    // NOTE: columns
    //  --1: potentially hidden column
    //  --2: list containing the items
    //  --3: the editor or a modal
    //  --4: a preview or a search helper

    // TODO: refactor ListPanel

    return (
      <Row className="full-height">
        <Col md={4} className={classes({hidden: editionMode || isAModalDisplayed})}/>

        <Col md={4} className="full-height">
          <h1 className="centered">{this.props.title}</h1>
          <div className="overflowing">
            <ListPanel items={this.props.data} model={model} />
          </div>
          {(model === 'doc') &&
            <ActionButton size={12}
                          label="add document"
                          action={open} />}
        </Col>

        <Col md={4} className="full-height">
          {isAModalDisplayed ?
            <Modal title={MODAL_TITLES[model]} /> :
            editionMode && <EditorPanel model={model} />}
        </Col>

        <Col md={4} className="full-height">
          {editionMode && <PreviewPanel model={model} />}
        </Col>
      </Row>
    );
  }
}

/**
 * Editor panel component
 */
@branch({
  facets(props) {
    return {
      parsed: props.model + 'Parsed'
    };
  },
  cursors(props) {
    return {
      buffer: ['states', props.model, 'editor']
    };
  }
})
class EditorPanel extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {
    const model = this.props.model,
          save = () => {
            this.context.tree.emit('element:save', {model: model});
          };

    return (
      <div className="full-height">
        <h1 className="centered">Editor</h1>
        <div className="overflowing">
          <Editor model={model}
                  buffer={this.props.buffer}
                  parsed={this.props.parsed} />
        </div>
        <div className="actions">
          {(model === 'book') && <ActionButton size={12} label="add item" />}
          <ActionButton size={12}
                        action={save}
                        label="save"
                        saving={this.props.saving}
                        loadingLabel="saving document …" />
        </div>
      </div>
    );
  }
}

/**
 * Preview panel component
 */
@branch({
  facets(props) {
    return {
      parsed: props.model + 'Parsed'
    };
  },
})
class PreviewPanel extends PureComponent {

  render() {
    const model = this.props.model;

    return (
      <div className="full-height">
        <h1 className="centered">Preview</h1>
        <div className="overflowing">
          <Preview model={this.props.model}
                   parsed={this.props.parsed} />
        </div>
      </div>
    );
  }
}

/**
 * List generic component
 */
@branch({
  cursors(props, context) {
    return {
      selection: ['states', props.model, 'selection']
    };
  }
})
class ListPanel extends PureComponent {

  @autobind
  renderItem(item) {
    const selection = this.props.selection || [];

    return <Item key={item.id}
                 item={item}
                 selection={selection}
                 active={selection[0] === item.id} />;
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
