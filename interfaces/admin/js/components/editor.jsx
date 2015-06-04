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

// Importing needed codemirror assets
require('codemirror/mode/markdown/markdown');

/**
 * Markdown editor component
 */
@branch({
  facets(props) {
    return {
      parsed: props.model + 'Parsed'
    };
  },
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
    const {vocs, docs} = this.props.parsed.data;

    return (
      <div className="full-height">
        <div className="editor-container">
          <textarea ref="editor" className="editor" />
        </div>
        <div className="entities-container">
          {vocs.map(v => <EditorEntity key={v.id} data={v} />)}
          {docs.map(d => <EditorEntity key={d.id} data={d} />)}
        </div>
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
 * Entity block
 */
class EditorEntity extends PureComponent {
  render() {
    const data = this.props.data,
          slug = data.type === 'document' ? 'doc_' : 'voc_';

    return (
      <div className="entity">
        {`(${slug}${data.slug_id}) ${data.title}`}
      </div>
    );
  }
}

/**
 * Markdown rendered preview component
 */
@branch({
  facets(props) {
    return {
      parsed: props.model + 'Parsed'
    };
  }
})
export class Preview extends PureComponent {
  render() {
    const markdown = this.props.parsed.markdown;

    return (
      <div className="editor-container full-height">
        <div className="preview full-height"
             dangerouslySetInnerHTML={{__html: markdown}}/>
      </div>
    );
  }
}
