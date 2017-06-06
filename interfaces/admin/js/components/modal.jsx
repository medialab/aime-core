/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import Col from 'react-bootstrap/lib/Col';
import {ActionButton} from './misc.jsx';
import PropTypes from 'baobab-react/prop-types';
import bibtex from 'bibtex-parser';
import {isURL} from 'validator';
import {readInputFile} from '../lib/helpers.js';
import {AuthorSelector} from './authorSelector.jsx';
import {ReferenceSelector} from './referenceSelector.jsx';
import {branch} from 'baobab-react/decorators';

/**
 * Generic modal component
 */
export class Modal extends Component {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor (props, context) {
    super(props, context);
    this.state = {title:'', author: this.context.tree.get('user')};
  }

  render() {
    const {title} = this.props,
          dismiss = () => {
            this.context.tree.emit('modal:dismiss', {model: this.context.model})
          },
          save = () => {
            this.context.tree.emit('modal:create', {
              model: this.context.model,
              title: this.state.title,
              author: this.state.author
            });
            dismiss();
          };

    return (
      <div className='Modal'>
        <h1>{title}</h1>
          <form>
            <label>title</label>
            <input value={this.state.title}
                    onChange={(e) => this.setState({title: e.target.value})}
                    placeholder="title" className="form-control" />
              {this.props.model === 'doc' &&
                <AuthorSelector
                  author={this.state.author.id}
                  users={this.props.users}
                  onChange={(author) => {
                    this.setState({author: author});
                  }}
                />
              }
                <ActionButton size={6} action={dismiss} label="dismiss"/>
                {this.state.title !== "" &&
                  <ActionButton size={6} action={save} label="save"/>
                }
          </form>
      </div>
    );
  }
}

/**
 * Resources creation modal
 */
const KINDS = [
  'quote',
  'link',
  'pdf',
  'image',
  'video'
];

@branch({
  cursors: {
    refs:['data', 'ref']
  }
})
export class ModalResources extends Component {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor(props, context) {
    super(props, context);

    this.state = {

      // Select state
      kind: null,

      // Form
      html: null,
      url: null,
      text: null,
      file: null,
      title: null,
      reference: null,

      // Display state
      uploading: false
    };
  }

  handleFile(e) {
    if (!e.target || !e.target.files || !e.target.files.length)
      return this.setState({file: null});

    this.setState({uploading: true});
    readInputFile(e.target.files[0], (err, dataUrl) => {
      this.setState({uploading: false, file: dataUrl});
    });
  }

  validate(state) {
    const kind = state.kind;

    // Different for each kind
    if (kind === 'image') {
      if (!state.url && !state.file)
        return false;
    }
    else if (kind === 'pdf') {
      if (!state.file)
        return false;
    }
    else if (kind === 'video') {
      if (!state.url)
        return false;
    }
    else if (kind === 'quote') {
      if (!state.text || !state.reference)
        return false;
    }
    else if (kind === 'link') {
      if (!state.url || !isURL(state.url))
        return false;
    }
    else if (kind) {
      console.log('Kind not supported yet.', kind);
      return false;
    }

    return true;
  }

  submit() {
    if (!this.validate(this.state))
      return;

    this.context.tree.emit('modal:create', {
      model: this.context.model,
      data: this.state
    });

    this.context.tree.emit('modal:dismiss', {
      model: this.context.model
    });
  }

  render() {
    const {
      kind,
      url,
      reference,
      uploading,
      file
    } = this.state;

    const title = this.props.title;

    // Actions
    const dismiss = () => {
      this.context.tree.emit('modal:dismiss', {
        model: this.context.model
      });
    };

    // Is the given url valid?
    let validURL = url ? isURL(url) : true;

    // Action button state
    let buttonState = 'normal';

    if (!this.validate(this.state))
      buttonState = 'disabled';
    else if (uploading)
      buttonState = 'saving';

    return (
      <div className='Modal'>
        <h1>{title}</h1>
        <form className="form-horizontal" encType="multipart/form-data">
          <div className="form-group">
            <label >kind</label>
            <select name="kind"
                    defaultValue={null}
                    value={kind}
                    onChange={(e) => this.setState({kind: e.target.value, file: null})}
                    className="form-control">
              <option value={null}>select kind …</option>
              {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        {(kind === 'link') &&
          <div className="form-group">
            <label>title</label>
            <input value={this.state.title}
                   onChange={(e) => this.setState({title: e.target.value})}
                   placeholder="title"
                   className="form-control" />
          </div>
        }
        {(kind === 'rich') &&
          <div className="form-group">
            <label>html</label>
            <textarea value={this.state.html}
                      onChange={(e) => this.setState({html: e.target.value})}
                      placeholder="<html>"
                      className="editor pre" />
          </div>
        }
        {(kind === 'quote') &&
          <div className="form-group">
            <label>text</label>
            <textarea value={this.state.text}
                      onChange={(e) => this.setState({text: e.target.value})}
                      placeholder="text …"
                      className="editor" />
          </div>
        }
        {(kind === 'pdf' || kind === 'image') &&
          <div className="form-group">
            <label>file</label>
            <input onChange={(e) => this.handleFile(e)}
                   className="form-control"
                   disabled={!!url}
                   type="file"
                   size={40} />
          </div>
        }
        {(kind === 'link' || kind === 'rich' || kind === 'video' || kind === 'image') &&
          <div className="form-group">
            <label>url</label>
            <input value={this.state.url}
                   disabled={!!file}
                   onChange={(e) => this.setState({url: e.target.value})}
                   placeholder="http://website.com/folder/file.ext"
                   className={classes('form-control', {error: !validURL})} />
          </div>
        }

        {kind !== null &&
          <div className="form-group">
              <label>reference</label>

              <ReferenceSelector
                reference={this.state.reference}
                references={this.props.refs}
                onChange={(e) => this.setState({reference: e.value})}
              />
          </div>
        }

      </form>

        <ActionButton size={6} action={dismiss} label="dismiss" />

        {kind !== null &&
          <ActionButton size={6}
                        action={(e) => this.submit(e)}
                        label="save"
                        loadingLabel="uploading file …"
                        state={buttonState} />}
      </div>
    );
  }
}
