/**
 * AIME-admin Selector Components
 * ==============================
 */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'baobab-react/prop-types';
import Select from 'react-select';
import _ from 'lodash';

import {ActionButton} from './misc.jsx';
import PureComponent from '../lib/pure.js';


export class ReferenceSelector extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  constructor(props, context) {
    super(props, context);

    this.getOptions = this.getOptions.bind(this);
    this.prepareOptions = this.prepareOptions.bind(this);
    this.fromIdToRef = this.fromIdToRef.bind(this);

  }

  fromIdToRef(id) {
    const ref = _.filter(this.props.references, function(d){
      return d.biblib_id === id;
    })

    return _.first(ref)
  }

  prepareOption(reference) {
    if(reference) {
      if(reference.id === null) return null;
      return { value: reference, label: _.trunc(reference.text, 80) };
    }
  }

  prepareOptions(references) {
    return _.map(references, r => this.prepareOption(r));
  }

  getOptions(input, callback) {
    input = input || '';

    const options = this.prepareOptions(this.props.references);

    if (!input || (input && input.length < 2)) {
      return callback(null, { options: [] });
    }

    const results = _.filter(options, option => {
      if (option.label.toLowerCase().includes(input)) {
        return option;
      }
    });

    return callback(null, { options: results });
  }

  render() {
    const lang = this.context.tree.get('lang');
    const blfModal = this.context.tree.get(['states', 'res', 'blfModal'])

    const onBlfModalToggle = () => {
      if (blfModal) {
        this.context.tree.emit('blfModal:open', {
          model: 'res',
          type: null
        });
      } else {
        this.context.tree.emit('blfModal:open', {
          model: 'res',
          type: 'creation'
        });
      }
    }

    return (
      <div className="form-group stretched-column">
        <Select.Async
          isLoading={false}
          value={this.prepareOption(this.props.reference)}
          ignoreAccents={true}
          clearable={false}
          name="select-author"
          placeholder="Search a Biblib reference"
          noResultsText="No results, keep on typing"
          loadOptions={this.getOptions}
          onChange={this.props.onChange}
        />
        <ActionButton
          action = {onBlfModalToggle}
          state = {blfModal ? "active" : "normal"}
          label={lang === 'fr' ? 'créer/éditer références': 'create/edit references'}
          loadingLabel={false}
          disabledLabel={true}
        />
      </div>
    );
  }
}
