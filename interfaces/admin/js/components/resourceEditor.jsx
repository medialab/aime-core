/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {ActionButton} from './misc.jsx';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import autobind from 'autobind-decorator';
import {ResourceIcon} from './misc.jsx';
import {resourceName} from '../lib/helpers.js';

/**
 * ResourceEditor component
 */
@branch({
  cursors: {
    data:['data', 'res'],
    states:['states', 'res']
  }
})
export default class ResourceEditor extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor (props,context) {
    super(props,context);
    this.state = {item: this.props.states.editor}
  }

  componentWillReceiveProps (props) {
    this.setState({item: props.states.editor})
  }

  setStateDeep (newState){
    console.log(this.state, newState, _.merge({}, this.state, newState));
    return _.merge({}, this.state, newState);
  }

  render() {

    return (
      <Row className="full-height">
        <form>
        {this.state.item.title &&
          <div className="form-group">
            <label>title</label>
            <input value={this.state.item.title}
                   onChange={(e) => this.setStateDeep({item: {title:e.target.value}})}
                   placeholder="title"
                   className="form-control" />
          </div>
        }

        {this.state.item.html &&
         <div className="form-group">
            <label>html</label>
            <textarea value={this.state.item.html}
                      onChange={(e) => this.setStateDeep({item: {html: e.target.value}})}
                      placeholder="<html>"
                      className="editor pre" />
          </div>}

        {this.state.item.text &&
          <div className="form-group">
              <label>text</label>
              <textarea value={this.state.item.text}
                        onChange={(e) => this.setStateDeep({item: {text: e.target.value}})}
                        placeholder="text …"
                        className="editor" />
          </div>
        }

        {this.state.item.url &&
          <div className="form-group">
            <label>url</label>
            <input value={this.state.item.url}
                   onChange={(e) => this.setStateDeep({item: {url: e.target.value}})}
                   placeholder="http://website.com/folder/file.ext"
                   className={classes('form-control')} />
          </div>
        }

        {this.state.item.path &&
          <div className="form-group">
            <label>path</label>
            <input value={this.state.item.path}
                   disabled="disabled"
                   placeholder="http://website.com/folder/file.ext"
                   className={classes('form-control')} />
          </div>
        }

        {(this.state.item.reference || {}).text &&
          <div className="form-group">
              <label>reference</label>
              <textarea value={this.state.item.reference.text}
                        disabled="disabled"
                        placeholder="text …"
                        className="editor pre" />
          </div>
        }

        </form>
      </Row>
    );
  }
}

