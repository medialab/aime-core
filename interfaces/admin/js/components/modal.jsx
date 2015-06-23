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


/**
 * Box generic component
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

export class ModalRessouces extends Component {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor(props,context) {
    super(props, context);

    this.state = {
      kind: "null",
      html: '',
      url: '',
      text: '',
      file: '',
      title: '',
      reference: ''
    };
  };

  render() {

    const {title} = this.props,
          dismiss = () => {
            this.context.tree.emit('modal:dismiss', {model: this.context.model})
          },
          save = () => {
            this.context.tree.emit('modal:create', {model: this.context.model, data: this.state});
            this.context.tree.emit('modal:dismiss', {model: this.context.model})
          }
    let kind = this.state.kind;

    return (
      <div className='Modal'>
        <h1>{title}</h1>
        <form className="form-horizontal">
          <div className="form-group">
            <label >kind</label>
            <select name="kind"
                    defaultValue={null}
                    value={this.state.kind}
                    onChange={(e) => this.setState({kind: e.target.value})}
                    className="form-control">
              <option value="null">select kind …</option>
              <option value="video"> video </option>
              <option value="quote"> quote </option>
              <option value="rich"> rich </option>
              <option value="link"> link </option>
              <option value="image"> image </option>
              <option value="pdf"> pdf </option>
            </select>
          </div>
        {kind === "pdf" &&
          <div className="form-group">
            <label>title</label>
            <input value={this.state.title}
                    onChange={(e) => this.setState({title: e.target.value})}
                    placeholder="title" className="form-control" />
          </div>
        }
        {(kind === "rich") &&
          <div className="form-group">
            <label>html</label>
            <textarea value={this.state.html}
                      onChange={(e) => this.setState({html: e.target.value})}
                      placeholder="<html>" className="editor pre" />
          </div>
        }
        {(kind === "quote") &&
          <div className="form-group">
            <label>text</label>
            <textarea value={this.state.text}
                      onChange={(e) => this.setState({text: e.target.value})}
                      placeholder="text …" className="editor" />
          </div>
        }
        {(kind === "pdf" || kind === "image") &&
          <div className="form-group">
            <label>file</label>
            <input value={this.state.file}
                    onChange={(e) => this.setState({file: e.target.value})}
                    className="form-control" type="file" size="40"/>
          </div>
        }
        {(kind === "link" || kind === "rich" || kind === "video" || kind === "image") &&
          <div className="form-group">
            <label>url</label>
            <input value={this.state.url}
                    onChange={(e) => this.setState({url: e.target.value})}
                    placeholder="http://website.com/folder/file.ext" className="form-control" />
          </div>
        }

        {kind !== null &&
          <div className="form-group">
            <label>reference</label>
            <textarea value={this.state.reference}
                      onChange={(e) => this.setState({reference: e.target.value})}
                      placeholder="text …" className="editor" />
          </div>
        }
      </form>

        <ActionButton size={6} action={dismiss} label="dismiss"/>

        {kind !== null &&
          <ActionButton size={6} action={save} label="save"/>}
      </div>
    );
  }
}
