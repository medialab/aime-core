/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import autobind from 'autobind-decorator';
import {ResourceIcon} from './misc.jsx';
import {resourceName} from '../lib/helpers.js';
import {ReferenceSelector} from './referenceSelector.jsx';

/**
 * ResourceEditor component
 */
@branch({
  cursors: {
    data:['data', 'res'],
    states:['states', 'res'],
    refs:['data', 'ref']
  }
})
export default class ResourceEditor extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  changeHandler(newState, fieldChanged) {
    if (fieldChanged) {
      const model = this.context.model;
      const value = fieldChanged.includes('reference') ?
        newState.item.reference[fieldChanged.substr(fieldChanged.indexOf('.') + 1)] :
        newState.item[fieldChanged];
      const payload = {
        fieldName: fieldChanged,
        fieldValue: value
      };
      this.context.tree.emit('resource:change', {model, payload});
    }
  }
  render() {

    const editorState = this.props.states.editor;
    const kind = editorState.kind;

    return (
      <Row className="full-height">
        <form>
        {editorState.title &&
          <div className="form-group">
            <label>title</label>
            <input value={editorState.title}
                   onChange={(e) => this.changeHandler({item: {title:e.target.value}})}
                   placeholder="title"
                   className="form-control" />
          </div>
        }

        {(kind === "video" || kind === 'rich' )&&
         <div className="form-group">
            <label>html</label>
            <textarea value={editorState.html}
                      onChange={(e) => this.changeHandler({item: {html: e.target.value}}, 'html')}
                      placeholder="<html>"
                      className="editor pre" />
          </div>}

        {kind === "quote"  &&
          <div className="form-group">
              <label>text</label>
              <textarea value={editorState.text}
                        onChange={(e) => this.changeHandler({item: {text: e.target.value}}, 'text')}
                        placeholder="text …"
                        className="editor" />
          </div>
        }

        {(kind === "video" || kind === 'link' || kind === 'url' || kind === 'rich' ) &&
          <div className="form-group">
            <label>url</label>
            <input value={editorState.url}
                   onChange={(e) => this.changeHandler({item: {url: e.target.value}}, 'url')}
                   placeholder="http://website.com/folder/file.ext"
                   className="form-control" />
          </div>
        }

        {(kind === "image" || kind === 'pdf') &&
          <div className="form-group">
            <label>path</label>
            <input value={editorState.path}
                   disabled="disabled"
                   placeholder="http://website.com/folder/file.ext"
                   className="form-control" />
          </div>
        }

        {(editorState.reference || {}).text !== null &&
          <div className="form-group">
              <label>reference</label>

              <ReferenceSelector
                reference={editorState.reference}
                references={this.props.refs}
                onChange={ (e) => this.context.tree.emit('ref:change', {ref:e}) }
                />

          </div>
        }

        </form>
      </Row>
    );
  }
}

