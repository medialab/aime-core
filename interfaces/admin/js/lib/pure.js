/**
 * Pure Render Component
 * ======================
 *
 * Just a simple React component extension that will apply the pure render
 * mixin's shouldComponentUpdate to the component.
 */
import React from 'react/addons';

const fn = React.addons.PureRenderMixin.shouldComponentUpdate;

export default class PureComponent {
  shouldComponentUpdate() {
    return fn.apply(this, arguments);
  }
}
