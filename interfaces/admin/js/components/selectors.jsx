import Select from 'react-select';

/**
 * Author search input
 */
export class AuthorSelect extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  constructor(props) {
    super(props);
    this.isLoading = false;

    this.state = {
      value: this.prepareOption(this.fromIdToAuthor(this.props.author))
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({value: this.prepareOption(this.fromIdToAuthor(nextProps.author))});
  }

  @autobind
  fromIdToAuthor(id) {
    return _.filter(this.props.users, (a) => a.id === id)[0];
  }

  prepareOption(user) {
    const fillLabel = (surname, name, username) => {
      const fullname = `${surname} ${name}`;
      return fullname.trim() === '' ? username : fullname;
    };
    return {
      value: user.id, label: fillLabel(user.surname, user.name, user.username)
    };
  }

  @autobind
  prepareOptions(users) {
    return _.map(users, u => this.prepareOption(u));
  }

  @autobind
  getOptions(input, callback) {
    input = input || '';

    const options = this.prepareOptions(this.props.users);

    if (!input || (input && input.length < 2)) {
      return callback(null, { options: [] });
    }

    const results = _.filter(options, (option) => {
      if (option.label.toLowerCase().includes(input)) {
        return option;
      }
    });

    return callback(null, {
      options: results
    });
  }

  @autobind
  changeHandler(newValue) {
    if (newValue) {
      const authorId = newValue.value;
      this.setState({value: this.prepareOption(this.fromIdToAuthor(authorId))});
      this.context.tree.set(['states', 'doc', 'author'], authorId);
    }
  }

  render() {
    return (
      <div className="form-group author">
        <Select.Async
          isLoading={this.isLoading}
          value={this.state.value}
          ignoreAccents={false}
          name="select-author"
          placeholder="Author..."
          noResultsText="None found"
          loadOptions={this.getOptions}
          onChange={this.changeHandler}
        />
      </div>
    );
  }
}
