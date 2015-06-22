/**
 * AIME-admin Editor
 * ==================
 *
 * Collection of components related to the markdown editor.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import CodeMirror from 'codemirror';
import PropTypes from 'baobab-react/prop-types';

// Importing needed codemirror assets
require('../lib/custom_mode.js');

/**
 * Markdown editor component
 */
export class Editor extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  constructor (props,context) {
    super(props,context);
    this.state = {title:""}
  }

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(
      React.findDOMNode(this.refs.editor),
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


    const {vocs, docs, vocItems=[], docItems=[]} = this.props.parsed.data;
  // const item = _.find(app.get('data', this.props.model), {id: app.get(["states","doc","selection"])[0]}) && 'none';
  /*          { this.props.model !== "book" &&
            <div className="form-group">
              <input value={item.title} defaultValue={item.title}
                    onChange={(e) => this.setState({title: e.target.value})}
                    placeholder="title" className="form-control" />
            </div>
          }*/

    return (
      <div className="full-height">
        <div className="editor-container">
            <div className="form-group">
              <label >chapter title</label>
              <input placeholder="chapter …" className="form-control" />
            </div>
             <div className="form-group">
             <label >heading title</label>
              <input placeholder="heading …" className="form-control" />
            </div>
          <textarea ref="editor" className="editor" />

        </div>
        <div className="entities-container">
          {vocItems.map((v, i) => <EditorEntity key={v ? v.id : i} data={v} slug={vocs[i]} />)}
          {docItems.map((d, i) => <EditorEntity key={d ? d.id : i} data={d} slug={docs[i]} />)}
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

/**
 * Markdown rendered preview component
 */
export class Preview extends PureComponent {
  render() {
    const markdown = this.props.parsed.markdown,
          {docs, docItems=[]} = this.props.parsed.data;

    return (
      <div className="editor-container full-height">
        <div className="preview"
             dangerouslySetInnerHTML={{__html: markdown}}/>

        {docItems.map((d, i) => <FootNote key={d ? d.id : i} data={d} index={i} />)}
      </div>
    );
  }
}

/**
 * Document footnote component
 */
class FootNote extends PureComponent {
  render() {
    const {index, data} = this.props;

    // If data doesn't exist
    if (!data)
      return (
        <div className="entity error">
          {`${index}. Non-existent`}
        </div>
      );

    return (
      <div className="entity">
        {`${index}. ${data.title}`}
      </div>
    );
  }
}
