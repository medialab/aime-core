/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import {
  Row,
  Col
} from 'react-flexbox-grid';

import {ActionButton} from './misc.jsx';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import autobind from 'autobind-decorator';
import {ResourceIcon} from './misc.jsx';
import {resourceName} from '../lib/helpers.js';

/**
 * Box generic component
 */
@branch({
  cursors: {
    data: ['data', 'res']
  }
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
  search({target: {value=''}}) {
    const search = value,
          data = this.props.data;

    let filteredItems;

    if (search.length > 2) {
      filteredItems = _.filter(data, function(n) {
        return ~resourceName(n).toLowerCase().indexOf(search.toLowerCase());
      });
    }
    else {
      filteredItems = [];
    }

    this.setState({filteredItems: filteredItems, search: search});
  }

  render() {
    const items = this.state.filteredItems,
          dismiss = () => {
            this.context.tree.emit('resSelector:dismiss', {model: this.context.model})
          },
          lang = this.context.tree.get('lang');

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
      <Row className="full-height stretched-column">
        <h1>{this.props.title}</h1>
        <input
          value={this.state.title}
          onChange={this.search}
          placeholder={lang === 'fr' ? 'que recherchez-vous ?' : 'what are you looking for?'}
          className="form-control" size="40" />
        <div style={{flex: 1}} className="scrollable">
          {result}
        </div>
        <div className="buttons-row">
          <ActionButton size={6} action={dismiss} label="close"/>
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

    this.context.tree.emit('resSelector:dismiss', {model: this.context.model});
  }

  render() {
    const item = this.props.item;
    let text = resourceName(item);

    return (
      <li>
        <div title={text} className={classes('box', 'chapter', {selected: this.props.active})}
             onClick={this.handleClick}>
          <ResourceIcon kind={item.kind} />
          {text}
        </div>
      </li>
    );
  }
}
