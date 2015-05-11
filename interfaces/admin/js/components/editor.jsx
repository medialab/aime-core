/**
 * AIME-admin Editor
 * ==================
 *
 * Collection of components related to the markdown editor.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import CodeMirror from 'codemirror';
import marked from 'marked';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';

// Importing needed codemirror assets
require('codemirror/mode/markdown/markdown');

@branch({
  cursors: {
    buffer: ['states', 'editor', 'buffer']
  }
})
export class Editor extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(
      React.findDOMNode(this.refs.editor),
      {
        mode: 'markdown',
        theme: 'base16-light',
        lineWrapping: true
      }
    );

    // Setting initial value
    this.editor.doc.setValue(this.props.buffer);

    // Listening to changes
    this.listener = doc => {
      this.context.tree.emit('buffer:change', doc.getValue());
    };

    this.editor.on('update', this.listener);
  }

  componentWillReceiveProps(props) {
    var currentValue = this.editor.doc.getValue();

    if (currentValue !== props.buffer)
      this.editor.doc.setValue(props.buffer);
  }

  render() {
    return (
      <div className="editor-container full-height">
        <h1>Editor</h1>
        <textarea ref="editor" className="editor"></textarea>
      </div>
    );
  }

  // TODO: clean & kill editor in some way
  componentWillUnmount() {

    // Cleaning up
    this.editor.off('update', this.listener);
  }
}

@branch({
  cursors: {
    buffer: ['states', 'editor', 'buffer']
  }
})
export class Preview extends PureComponent {
  render() {
    const markdown = marked(this.props.buffer);

    return (
      <div className="editor-container full-height">
        <h1>Preview</h1>
        <div className="preview full-height"
             dangerouslySetInnerHTML={{__html: markdown}}/>
      </div>
    );
  }
}
