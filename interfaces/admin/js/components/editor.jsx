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
import Select from 'react-select';

// Importing needed codemirror assets
require('../lib/custom_mode.js');

/**
 * Markdown editor component
 */
export default class Editor extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  componentWillMount(){
    this.listener = (e) => {
      var i =  e.data;
      this.editor.doc.replaceSelection(`![${i.type}](res_${i.slug_id})\n`);
    };
    this.context.tree.on("resSelector:add", this.listener);
  }

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(
      ReactDOM.findDOMNode(this.refs.editor),
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

  componentWillUnmount(){
    this.context.tree.off("resSelector:add", this.listener);
  }

  componentWillReceiveProps(props) {
    const currentValue = this.editor.doc.getValue();

    if (currentValue !== props.buffer)
      this.editor.doc.setValue(props.buffer);
  }

  render() {
    const {vocs, docs, vocItems=[], docItems=[]} = this.props.parsed.data;
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
              <EditorAuthor users={this.props.users} />
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
 * Author search input
 */
class EditorAuthor extends PureComponent {
  constructor() {
    super();
    this.isLoading = false;

    this.getOptions = this.getOptions.bind(this);
    this.changeHandler = this.changeHandler.bind(this);

    this.state = {
      value: null
    };
  }

  prepareOptions(users) {
    const fillLabel = (surname, name, username) => {
      const fullname = `${surname} ${name}`;
      return fullname.trim() === '' ? username : fullname;
    };

    return _.map(users, u => (
      {value: u.id, label: fillLabel(u.surname, u.name, u.username)}
    ));
  }

  getOptions(input, callback) {
    input = input || '';

    const options = this.prepareOptions(this.props.users);

    if (!input || (input && input.length < 2)) {
      return callback(null, { options: [] });
    }

    const results = _.filter(options, (option) => {
      if (option.label.toLowerCase().includes(input)) {
        return option;
      }
    });

    return callback(null, {
      options: results
    });
  }

  changeHandler(newValue) {
    this.setState({value: newValue});
  }

  render() {
    return (
      <div className="form-group author">
        <Select.Async
          isLoading={this.isLoading}
          value={this.state.value}
          selected={this.state.value}
          ignoreAccents={false}
          name="select-author"
          placeholder="Author..."
          noResultsText="None found"
          loadOptions={this.getOptions}
          onChange={this.changeHandler}
        />
      </div>
    );
  }
}
