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
