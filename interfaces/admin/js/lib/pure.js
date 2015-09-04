/**
 * Pure Render Component
 * ======================
 *
 * Just a simple React component extension that will apply the pure render
 * mixin's shouldComponentUpdate to the component.
 */
import React, {Component} from 'react/addons';
import PropTypes from 'baobab-react/prop-types';

const fn = React.addons.PureRenderMixin.shouldComponentUpdate;

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
