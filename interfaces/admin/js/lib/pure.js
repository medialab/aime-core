/**
 * Pure Render Component
 * ======================
 *
 * Just a simple React component extension that will apply the pure render
 * mixin's shouldComponentUpdate to the component.
 */
import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PropTypes from 'baobab-react/prop-types';

const fn = PureRenderMixin.shouldComponentUpdate;

export default class PureComponent extends Component{
  shouldComponentUpdate() {
    return fn.apply(this, arguments);
  }
}

export class BranchedComponent extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    cursors: PropTypes.cursors
  };
}
