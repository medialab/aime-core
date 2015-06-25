/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {ActionButton} from './misc.jsx';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import autobind from 'autobind-decorator';
import {ResourceIcon} from './misc.jsx';

function buildItemTitle(item) {
  let text = false;

  if (item.reference !== null)
    text = item.reference.text;

  return item.title ||
         text ||
         item.url ||
         item.original ||
         item.text ||
         item.path ||
         '?';
}

/**
 * Box generic component
 */

@branch({
  cursors:{data:['data', 'res']}
})

export default class ResourceSelector extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor (props,context) {
    super(props,context);

    this.state = {
      filteredItems: [],
      search: ''
    };
  }

  @autobind
  renderItem(item) {
    return <SelectorItem key={item.id}
                         item={item} />;
  }

  @autobind
  filterItems({target: {value=''}}) {
    const search = value;

    let data = this.props.data;

    if (search.length > 2) {
      data = _.filter(data, function(n) {
        return ~buildItemTitle(n).indexOf(search);
      });
    }
    else {
      data = [];
    }

    this.setState({filteredItems: data, search: search});
  }

  render() {
    const items = this.state.filteredItems,
          dismiss = () => {
            this.context.tree.emit('resSelector:dismiss', {model: this.context.model})
          };

    let result;

    if (!this.state.search && !items.length)
      result = null;
    else if (this.state.search.length < 3 && !items.length)
      result = <div className="centered">type more characters</div>;
    else if (this.state.search.length > 2 && !items.length)
      result = <div className="centered">no results</div>;
    else
      result = <ul className="list">{items.map(this.renderItem)}</ul>;

    return (
      <Row className="full-height">
        <h1>{this.props.title}</h1>
          <input value={this.state.title}
                 onChange={_.throttle(this.filterItems, 1000)}
                 placeholder="what are you looking for?"
                 className="form-control" size="40"/>
        <div className="overflowing">
          {result}
        </div>
        <div className="form-group">
          <ActionButton size={6} action={dismiss} label="dismiss"/>
        </div>
      </Row>
    );
  }
}

/**
 * A generic list item
 */
class SelectorItem extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  @autobind
  handleClick() {
    this.context.tree.emit('resSelector:add', {
      model: this.context.model,
      slug_id: this.props.item.slug_id,
      type: this.props.item.type
    });
  }

  render() {
    const item = this.props.item;
    let text;

    return (
      <li>
        <div className={classes('box', 'chapter', {selected: this.props.active})}
             onClick={this.handleClick}>
          <ResourceIcon kind={item.kind} />
          {' ' + buildItemTitle(item)}
        </div>
      </li>
    );
  }
}
