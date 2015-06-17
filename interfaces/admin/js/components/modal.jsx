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
    this.state = {}
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
        <form className="form-horizontal">
          <textarea value={this.state.title} onChange={(e) => this.setState({title: e.target.value})} className="editor"/>
        </form>
        <ActionButton size={6} action={dismiss} label="dismiss"/>
        <ActionButton size={6} action={save} label="save"/>
      </div>
    );
  }
}
export class ModalRessouces extends Component {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor (props,context) {
    super(props,context);
    this.state = {kind:null}
  };

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
        <form className="form-horizontal">

          <select name="kind" onChange={(e) => this.setState({kind: e.target.value})} >
            <option value="video"> video </option>
            <option value="quote"> quote </option>
            <option value="rich"> rich </option>
            <option value="html"> html </option>
            <option value="image"> image </option> 
            <option value="pdf"> pdf </option>
          </select>
        </form>
        <ActionButton size={6} action={dismiss} label="dismiss"/>
        <ActionButton size={6} action={save} label="save"/>
      </div>
    );
  }
}