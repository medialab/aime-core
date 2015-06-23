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
import {ActionButton, Toolbar} from './misc.jsx';
import {Modal, ModalRessouces} from './modal.jsx';
import ResourceSelector from './resourceSelector.jsx';


const MODAL_TITLES = {
  doc: 'create document',
  res: 'create ressource'
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
      searching: ['states', model, 'searching']
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
    const modalOpen = () => {
      this.context.tree.emit('modal:open', {
        model: model,
        type: 'creation',
        title: 'create'
      });
    };

    // NOTE: columns
    //  --1: potentially hidden column
    //  --2: list containing the items
    //  --3: the editor or a modal
    //  --4: a preview or a search helper

    // TODO: refactor ListPanel

    const modal = model === "doc" ?
      <Modal title={MODAL_TITLES[model]} /> :
      <ModalRessouces title={MODAL_TITLES[model]} />;

    return (
      <Row className="full-height">
        <Col md={4} className={classes({hidden: editionMode || isAModalDisplayed})}/>

        <Col md={4} className="full-height">

          <h1 className="centered">{this.props.title}</h1>

          <div className="overflowing">
            <ListPanel items={this.props.data} model={model} />
          </div>
          {( (model === 'doc' || model === 'res')   && isThereAnyData) &&
            <ActionButton size={12}
                          label="create"
                          action={modalOpen} />}
        </Col>

        <Col md={4} className="full-height">
          {isAModalDisplayed ?
            modal  :
            editionMode && <EditorPanel model={model} />}
        </Col>

        <Col md={4} className={classes({'full-height':true, hidden: this.props.searching})}>
          {editionMode && <PreviewPanel model={model} />}
        </Col>

        {this.props.searching && 

          <Col md={4} className="full-height searching">
            <ResourceSelector title="select ressource" model={model} />
          </Col>
        }

        <Toolbar/>

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
      buffer: ['states', props.model, 'editor'],
      title: ['states', props.model, 'title'],
      saving: ['states', props.model, 'saving']
    };
  }
})
class EditorPanel extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {
    const {model, saving} = this.props,
          save = () => {
            this.context.tree.emit('element:save', {model: model});
          },
          openSelector = () => {
            this.context.tree.emit('resSelector:open', {model: model});
          };

    return (
      <div className="full-height">
        <h1 className="centered">Editor</h1>
        <div className="overflowing">
          <Editor model={model}
                  buffer={this.props.buffer}
                  title={this.props.title}
                  parsed={this.props.parsed}
                  selected={this.props.selected}
                   />
        </div>
        <div className="actions">
          <ActionButton size={12} action={openSelector} label="add item" />
          <ActionButton size={12}
                        action={save}
                        label="save"
                        state={saving ? 'saving' : 'normal'}
                        loadingLabel="saving document…" />
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
      return <div className="centered">...</div>;
    else
      return <ul className="list">{items.map(this.renderItem)}</ul>;
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
    let text;

    if(item.reference !== null && this.context.model === 'res')
      text = item.reference.text;

    return (
      <li>
        <div className={classes('box', 'chapter', {selected: this.props.active})}
             onClick={this.handleClick}>

          {this.context.model === 'res' &&
            <span className="kind">{item.kind} ] </span>
          }
          {item.title || text || item.url || item.original}


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
