/**
 * AIME-admin Editor
 * ==================
 *
 * Collection of components related to the markdown editor.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import CodeMirror from 'codemirror';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import parser from '../lib/parser.js';

// Importing needed codemirror assets
require('codemirror/mode/markdown/markdown');

/**
 * Markdown editor component
 */
@branch({
  cursors(props) {
    return {
      buffer: ['states', props.model, 'editor']
    };
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
        mode: {
          name: 'markdown',
          underscoresBreakWords: false
        },
        theme: 'base16-light',
        lineWrapping: true
      }
    );

    // Setting initial value
    this.editor.doc.setValue(this.props.buffer);

    // Listening to changes
    this.listener = doc => {
      this.context.tree.emit('buffer:change', {
        markdown: doc.getValue(),
        model: this.props.model
      });
    };

    this.editor.on('update', this.listener);
  }

  componentWillReceiveProps(props) {
    const currentValue = this.editor.doc.getValue();

    if (currentValue !== props.buffer)
      this.editor.doc.setValue(props.buffer);
  }

  render() {
    return (
      <div className="editor-container full-height">
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

/**
 * Markdown rendered preview component
 */
@branch({
  cursors(props) {
    return {
      buffer: ['states', props.model, 'editor']
    };
  }
})
export class Preview extends PureComponent {
  render() {
    const {markdown, data} = parser(this.props.buffer);

    return (
      <div className="editor-container full-height">
        <div className="preview full-height"
             dangerouslySetInnerHTML={{__html: markdown}}/>
      </div>
    );
  }
}
