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
import autobind from 'autobind-decorator';
import {isURL} from 'validator';
import {readInputFile} from '../lib/helpers.js';

/**
 * Generic modal component
 */
export class Modal extends Component {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor (props,context) {
    super(props,context);
    this.state = {title:""}
  }

  render() {
    const {title} = this.props,
          dismiss = () => {
            this.context.tree.emit('modal:dismiss', {model: this.context.model})
          },
          save = () => {
            this.context.tree.emit('modal:create', {model: this.context.model, data: this.state.title});
            this.context.tree.emit('modal:dismiss', {model: this.context.model})
          };

    return (
      <div className='Modal'>
        <h1>{title}</h1>
          <form>
            <label >title</label>
            <input value={this.state.title}
                    onChange={(e) => this.setState({title: e.target.value})}
                    placeholder="title" className="form-control" />


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
  'video',
  'rich'
];

export class ModalRessouces extends Component {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor(props,context) {
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

  @autobind
  handleFile(e) {
    this.setState({uploading: true});
    readInputFile(e.target.files[0], (err, dataUrl) => {
      this.setState({uploading: false, file: dataUrl});
    });
  }

  render() {
    const {
      kind,
      url,
      reference
    } = this.state;

    const title = this.props.title;

    // Actions
    const dismiss = () => {
      this.context.tree.emit('modal:dismiss', {
        model: this.context.model
      });
    };

    const save = () => {
      this.context.tree.emit('modal:create', {
        model: this.context.model,
        data: this.state
      });

      this.context.tree.emit('modal:dismiss', {
        model: this.context.model
      });
    };

    // Is the given reference valid?
    let validReference = !!reference;

    try {
      const parsed = bibtex(reference);
      validReference = !!Object.keys(parsed).length;
    }
    catch (e) {
      validReference = false;
    }

    // Is the given url valid?
    let validURL = url ? isURL(url) : true;

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
        {kind === "pdf" &&
          <div className="form-group">
            <label>title</label>
            <input value={this.state.title}
                   onChange={(e) => this.setState({title: e.target.value})}
                   placeholder="title"
                   className="form-control" />
          </div>
        }
        {(kind === "rich") &&
          <div className="form-group">
            <label>html</label>
            <textarea value={this.state.html}
                      onChange={(e) => this.setState({html: e.target.value})}
                      placeholder="<html>"
                      className="editor pre" />
          </div>
        }
        {(kind === "quote") &&
          <div className="form-group">
            <label>text</label>
            <textarea value={this.state.text}
                      onChange={(e) => this.setState({text: e.target.value})}
                      placeholder="text …"
                      className="editor" />
          </div>
        }
        {(kind === "pdf" || kind === "image") &&
          <div className="form-group">
            <label>file</label>
            <input value={this.state.file}
                   onChange={this.handleFile}
                   className="form-control"
                   type="file"
                   size={40} />
          </div>
        }
        {(kind === "link" || kind === "rich" || kind === "video" || kind === "image") &&
          <div className="form-group">
            <label>url</label>
            <input value={this.state.url}
                   onChange={(e) => this.setState({url: e.target.value})}
                   placeholder="http://website.com/folder/file.ext"
                   className={classes('form-control', {error: !validURL})} />
          </div>
        }

        {kind !== null &&
          <div className="form-group">
            <label>reference</label>
            <textarea value={reference}
                      onChange={(e) => this.setState({reference: e.target.value})}
                      placeholder="bibtex …"
                      className={classes('editor', {error: !validReference})} />
          </div>
        }
      </form>

        <ActionButton size={6} action={dismiss} label="dismiss" />

        {kind !== null &&
          <ActionButton size={6}
                        action={save}
                        label="save"
                        disabledLabel="uploading file …"
                        state={this.state.uploading ? 'disabled' : 'normal'} />}
      </div>
    );
  }
}
