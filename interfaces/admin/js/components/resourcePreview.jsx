/**
 * AIME-admin Ressource Preview
 * ===================
 *
 * Component in charge of displaying html preview for ressources
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import PropTypes from 'baobab-react/prop-types';

/**
 * Markdown rendered preview component
 */
export default class resourcePreview extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {
    return (
      <div className="editor-container full-height preview-container">
        <div className="preview" dangerouslySetInnerHTML={{__html: this.props.parsed}}/>
      </div>
    );
  }

}
