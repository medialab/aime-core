/**
 * AIME-admin Selector Components
 * ==============================
 */
import React from 'react';
import ReactDOM from 'react-dom';
import PureComponent from '../lib/pure.js';
import PropTypes from 'baobab-react/prop-types';
import Select from 'react-select';
import _ from 'lodash';

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
    if(reference.id === null) return null;
    if(reference) return { value: reference, label: _.trunc(reference.text, 80) };
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
    return (
      <div className="form-group author">
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
      </div>
    );
  }
}
