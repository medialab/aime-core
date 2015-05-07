/**
 * Pure Render Component
 * ======================
 *
 * Just a simple React component extension that will apply the pure render
 * mixin's shouldComponentUpdate to the component.
 */
import React, {Component} from 'react/addons';

const fn = React.addons.PureRenderMixin.shouldComponentUpdate;

export default class PureComponent extends Component{
  shouldComponentUpdate() {
    return fn.apply(this, arguments);
  }
}
