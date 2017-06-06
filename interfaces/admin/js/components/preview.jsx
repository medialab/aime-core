/**
 * AIME-admin Preview
 * ===================
 *
 * Component in charge of displaying the rendered markdown from the editor.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import PropTypes from 'baobab-react/prop-types';

/**
 * Markdown rendered preview component
 */
export default class Preview extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  fromIdToAuthor(id) {
    const usersIndex = this.context.tree.facets.usersIndex.get();
    const user = usersIndex[id];
    return user ? user.surname + ' ' + user.name : '';
  }

  render() {
    const {html, data} = this.props.parsed,
          {docs, docItems=[]} = data;

    return (
      <div className="editor-container full-height preview-container">
          <p className="title">{this.props.title}</p>
          <p className="author">{this.fromIdToAuthor(this.props.author)}</p>
        <div className="preview" dangerouslySetInnerHTML={{__html: html}}/>
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
