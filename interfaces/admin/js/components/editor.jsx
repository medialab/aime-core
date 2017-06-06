/**
 * AIME-admin Editor
 * ==================
 *
 * Collection of components related to the markdown editor.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import PureComponent from '../lib/pure.js';
import CodeMirror from 'codemirror';
import PropTypes from 'baobab-react/prop-types';
import {AuthorSelector} from './authorSelector.jsx';
import autobind from 'autobind-decorator';
import {branch} from 'baobab-react/decorators';

// Importing needed codemirror assets
require('../lib/custom_mode.js');

/**
 * Markdown editor component
 */

 @branch({
  cursors: {
    states:['states', 'doc'],
  }
})
export default class Editor extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  componentWillMount() {
    this.resListener = (e) => {
      let i =  e.data;

      const cursor = this.editor.doc.getCursor(),
            previousLine = cursor.line && this.editor.doc.getLine(cursor.line - 1).trim(),
            line = this.editor.doc.getLine(cursor.line).trim();

      let addition = '';

      if (previousLine && !line)
        addition += '\n';

      if (line)
        addition += '\n\n';

      addition += `![${i.type}](res_${i.slug_id})\n`;

      this.editor.doc.replaceSelection(addition);
    };
    this.context.tree.on("resSelector:add", this.resListener);
  }

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(
      this.refs.editor,
      {
        mode: {
          name: 'aime-markdown',
          underscoresBreakWords: false
        },
        theme: 'base16-light',
        lineWrapping: true,
        viewportMargin: Infinity
      }
    );

    // Setting initial values
    this.editor.doc.setValue(this.props.buffer);

    // Listening to changes
    this.editorListener = doc => {
      this.context.tree.emit('buffer:change', {
        markdown: doc.getValue(),
        model: this.props.model
      });
    };

    this.editor.on('update', this.editorListener);
  }

  componentWillUnmount() {

    // Cleaning up
    this.editor.off('update', this.listener);
    this.context.tree.off("resSelector:add", this.listener);
  }

  componentWillReceiveProps(props) {
    if (this.editor === undefined) {
      return;
    }
    const currentValue = this.editor.doc.getValue();

    if (currentValue !== props.buffer)
      this.editor.doc.setValue(props.buffer);
  }

  render() {
    const {
      vocs,
      docs,
      vocItems = [],
      docItems = []
    } = this.props.parsed.data;

    return (
      <div className="full-height">
        <div className="editor-container">
            { this.props.model === "doc" &&
              <div className="form-group">
                <input value={this.props.title}
                        defaultValue={this.props.title}
                        onChange={(e) => this.context.tree.emit('title:change', {model: this.props.model, title: e.target.value})}
                        placeholder="title" className="form-control" />
              </div>
            }
            { this.props.model === "doc" &&
              <AuthorSelector
                author={this.props.states.author}
                users={this.props.users}
                onChange={(author) => this.context.tree.emit('author:change', {model: this.props.model, author: author.id})} />
            }
            { this.props.model === "book" &&
              <div className="form-group">
                <label >chapter title</label>
                <input placeholder="chapter …" className="form-control" />
                <label >heading title</label>
                <input placeholder="heading …" className="form-control" />
              </div>
            }
          <textarea ref="editor" className="editor" />
        </div>
        <div className="entities-container">
          {vocItems.map((v, i) => <EditorEntity key={v ? v.id : i} data={v} slug={vocs[i]} />)}
          {docItems.map((d, i) => <EditorEntity key={d ? d.id : i} data={d} slug={docs[i]} />)}
        </div>
      </div>
    );
  }
}

/**
 * Entity block
 */
class EditorEntity extends PureComponent {
  render() {
    const data = this.props.data;

    // If data doesn't exist
    if (!data)
      return (
        <div className="entity error">
          {`(${this.props.slug}) Non-existent`}
        </div>
      );

    return (
      <div className="entity">
        {`(${this.props.slug}) ${data.title}`}
      </div>
    );
  }
}
