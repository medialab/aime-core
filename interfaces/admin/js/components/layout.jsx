/**
 * AIME-admin Layout Components
 * =============================
 *
 * Components dealing with the edition views layout and placing lists, editor,
 * preview, selector etc.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import classes from 'classnames';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import autobind from 'autobind-decorator';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Editor from './editor.jsx';
import Preview from './preview.jsx';
import List from './list.jsx';
import {ActionButton, Toolbar} from './misc.jsx';
import {Modal, ModalRessouces} from './modal.jsx';
import ResourceSelector from './resourceSelector.jsx';
import ResourceEditor from './resourceEditor.jsx';


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
          isSomethingSelected = (this.props.selection || []).length > (1 - (model === 'doc' || model === 'res')),
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
        <Col md={4} className={classes({hidden: editionMode || isAModalDisplayed})} />

        <Col md={4} className="full-height">

          <h1 className="centered">{this.props.title}</h1>

          <div className="overflowing">
            <ListPanel items={this.props.data} model={model} />
          </div>
          {((model === 'doc' || model === 'res') && isThereAnyData) &&
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
          {(editionMode && model !== "res")  && <PreviewPanel model={model} />}
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
  render() {
    if (!this.props.items)
      return <div className="centered"><span className="glyphicon glyphicon-lg glyphicon-refresh spinning"></span></div>;
    else
      return <List {...this.props} />;
  }
}

/**
 * Editor panel component
 */
@branch({
  facets(props) {
    if (props.model === "doc") {
      return { parsed: props.model + 'Parsed'};
    } else {
      return {};
    }
  },
  cursors(props) {
    return {
      users: ['data', 'users'],
      buffer: ['states', props.model, 'editor'],
      title: [ 'states', props.model, 'title'],
      saving: ['states', props.model, 'saving'],
      author: ['states', props.model, 'author']
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

          {this.props.model === "doc" ?
          <Editor model={model}
                  author={this.props.author}
                  users={this.props.users}
                  buffer={this.props.buffer}
                  title={this.props.title}
                  parsed={this.props.parsed}
                   />
          :
          <ResourceEditor
                  model={model}
                  />}
        </div>
        <div className="actions">
          {this.props.model === "doc" && <ActionButton size={12} action={openSelector} label="add item" />}
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
    if(props.model === "doc") return { parsed: props.model + 'Parsed'};
    else return {};
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
