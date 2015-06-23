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

function buildItemTitle(item) {
      var text = false;
      if(item.reference !== null) text = item.reference.text;
      return (item.title || text || item.url || item.original || item.text);
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
      search:""
    }
  }

  @autobind
  renderItem(item) {
    const selection = this.props.selection || [];
    return <SelectorItem key={item.id}
                         item={item} />;
  }

  @autobind
  filterItems (e){

    const search = e.target.value;
    let data = this.props.data;

    if(search !== ""){
      data = _.filter(data, function(n) {
        return ~buildItemTitle(n).indexOf(search);
      });
    }else{ data = []; }

    this.setState({filteredItems: data, search: search});
  }

  render() {
    const items = this.state.filteredItems,
          dismiss = () => {
            this.context.tree.emit('resSelector:dismiss', {model: this.context.model})
          };

    return (
      <Row className="full-height">
        <h1>{this.props.title}</h1>
        <div className="form-group">
          <input value={this.state.title}
                 onChange={_.throttle(this.filterItems, 1000)}
                 placeholder="what are you looking for?"
                 className="form-control" size="40"/>
        </div>
        <div className="overflowing">
          { (this.state.search !== "" && items.length < 1)
            && <div className="centered">no result</div>
          }
          { items && <ul className="list">{items.map(this.renderItem)}</ul>}
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
            <span className={classes('glyphicon',item.kind )} aria-hidden="true">`
            </span> {buildItemTitle(item)}
        </div>
      </li>
    );
  }
}
