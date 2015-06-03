/**
 * AIME-admin Vocabulary Component
 * ================================
 *
 * Component dealing with the vocabulary model's view.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import {ListLayout} from './list.jsx';

/**
 * Main component
 */
export default class Vocabulary extends PureComponent {
  render() {
    return <ListLayout title="Vocabulary" model="vocabulary" />;
  }
}
