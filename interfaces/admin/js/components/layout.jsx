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
      users: ['data', 'users'],
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

    // NOTE: columns
    //  --1: potentially hidden column
    //  --2: list containing the items
    //  --3: the editor or a modal
    //  --4: a preview or a search helper

    const modal = model === "doc" ?
      <Modal title={MODAL_TITLES[model]} model={model} users={this.props.users} /> :
      <ModalRessouces title={MODAL_TITLES[model]} />;

    return (
      <Row className="full-height">
        <Col md={4} className={classes({hidden: editionMode || isAModalDisplayed})} />

        <Col md={4} className="full-height">
          <h1 className="centered">{this.props.title}</h1>
          <ListPanel items={this.props.data} model={model} />
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
      author: ['states', props.model, 'author'],
      status: ['states', props.model, 'status']
    };
  }
})
class EditorPanel extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {
    const {model, saving} = this.props,
          save = (e, status = this.props.status) => {
            this.context.tree.emit('element:save', {model, status});
          },
          openSelector = () => {
            this.context.tree.emit('resSelector:open', {model: model});
          },
          togglePublish = () => {
            const status = this.props.status === 'public' ? 'private' : 'public';
            save(null, status);
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
                  parsed={this.props.parsed} />
          :
          <ResourceEditor
                  model={model}
                  />}
        </div>
        <div className="actions">
          {this.props.model === "doc" && <ActionButton size={12} action={openSelector} label="add item" />}
          <ActionButton size={6}
                        action={save}
                        label="save"
                        state={saving ? 'saving' : 'normal'}
                        loadingLabel="saving document…" />
          {this.props.model === "doc" &&
            <ActionButton
              size={6}
              action={togglePublish}
              label={this.props.status === 'public' ? 'unpublish' : 'publish'} />}
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
  cursors(props) {
    return {
      modelState: [ 'states', props.model]
    };
  }
})
class PreviewPanel extends PureComponent {

  render() {
    const model = this.props.model;
    return (
      <div className="full-height">
        <h1 className="centered">Preview</h1>
        <div className="overflowing">
          <Preview model={this.props.model}
                   parsed={this.props.parsed}
                   title={this.props.modelState.title}
                   author={this.props.modelState.author}
                   />
        </div>
      </div>
    );
  }
}
