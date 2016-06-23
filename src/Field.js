import React, { PropTypes } from "react";
import debounce from "debounce";
import { autobind } from "core-decorators";

class Field extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    debounce: PropTypes.number.isRequired,
    errorMessage: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    validateOnMount: PropTypes.bool,
  };

  static defaultProps = {
    debounce: 0,
    errorMessage: "Invalid data",
    onChange: () => {},
  };

  static contextTypes = {
    getValue: PropTypes.func,
    setValue: PropTypes.func,
    setValid: PropTypes.func,
    getError: PropTypes.func,
    isValid: PropTypes.func,
    register: PropTypes.func,
  };

  state = {
    _value: null,
    _valid: null,
    _show: false,
    _message: null,
    _validating: false,
  };

  constructor(props) {
    super(props);
    if (props.debounce) {
      this._debouncedShow = debounce(this._show, props.debounce);
      this.asyncValidation = debounce(this._asyncValidation, props.debounce);
    } else {
      this._debouncedShow = this._show;
      this.asyncValidation = this._asyncValidation;
    }
  }

  componentDidMount() {
    if (this.context.register) {
      this.context.register(this.props.name);
    }

    if (this.props.validateOnMount) {
      this.validate(void 0, true);
    }

    // Set valid to true when no children, i.e. rules are present
    if (!this.rules().length) {
      this.setValid(true);
    }

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.validateOnMount) {
      this.validate(void 0, true);
    }
  }

  getValue() {
    const { name } = this.props;
    return this.context.getValue ?
           this.context.getValue(name) :
           this.state._value;
  }

  setValue(value, event = {}) {
    const { name } = this.props;
    const result = this.context.setValue ?
                   this.context.setValue(name, value) :
                   this.setState({
                     _value: value,
                   });
    if (this.clearOnChange) {
      this.show(false);
    }
    this.validate(value);

    if (this.props.onChange) {
      const e = { currentTarget: {}, target: {}, ...event};
      e.currentTarget.value = e.target.value = value;
      this.props.onChange(e);
    }

    return result;
  }

  setValid(valid, msg = null, key = null, ignoreDebounce = false) {
    const { name } = this.props;
    if (ignoreDebounce) {
      this._show(valid === false);
    } else {
      this.show(valid === false);
    }
    return this.context.setValid ?
           this.context.setValid(name, valid, msg) :
           this.setState({
             _invalid_on: key,
             _valid: valid,
             _message: valid ? null : msg,
           });
  }

  isValid() {
    const { name } = this.props;
    const valid = this.context.isValid ?
                  this.context.isValid(name) :
                  this.state._valid;
    return valid || (this.state._show ? false : null);
  }

  isProcessing() {
    return this.state._validating;
  }

  error() {
    const { name } = this.props;
    if (!this.state._show) {
      return null;
    }
    return this.context.getError ?
           this.context.getError(name) :
           this.state._message;
  }

  _show(show) {
    this.setState({
      _show: show,
    });
  }

  show(show) {
    if (!show) {
      this._show(show);
    } else {
      this._debouncedShow(show);
    }
  }

  errorKey() {
    return this.state._show ? this.state._invalid_on : null;
  }

  rules() {
    const { children } = this.props;
    return React.Children.toArray(children).map(rule => {
      const validator = rule.type;
      if (typeof validator === "function") {
        return {
          fn: validator,
          options: rule.props,
        };
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn("Rule supplied is not a function");
        }
        return null;
      }
    }).filter(rule => !!rule);
  }

  validate(value = this.getValue(), ignoreDebounce = false) {
    let { errorMessage } = this.props;
    let key = null;
    const isValid = result => {
      if (typeof result === "object") {
        // Assign error message if found
        if ("message" in result) {
          errorMessage = result.message;
        }
        if ("key" in result && !result.valid) {
          key = result.key;
        }
        return result.valid;
      } else {
        return !!result; // Treat as boolean / null / undefined
      }
    };
    let async = false;
    // Resolve all rules as promises
    const promises = [];
    const results = [];



    let valid = true;
    // Iterate over provided rules
    for (const rule of this.rules()) {
      // Separate promises
      if (rule.fn.async || rule.options.async) {
        async = true;
        promises.push(rule.fn);
      } else {
        const result = rule.fn({ ...rule.options, value });
        if (typeof result.then === "function") {
          async = true;
          promises.push(() => result);
        } else {
          results.push(result);
          // Exit as soon as we're invalid
          if (!isValid(result)) {
            if (rule.fn.noDebounce || rule.options.noDebounce) {
              ignoreDebounce = true;
            }
            valid = false;
            break;
          }
        }
      }
    }

    // Process promises
    if (valid && async) {
      // Set flag for async processing
      this.setValid(null, null, null, ignoreDebounce);
      this.show(false);

      this.asyncValidation(promises);
    }

    if (!async || !valid) {
      // Finished processing
      this.setState({ _validating: false });
      this.setValid(valid, errorMessage, key, ignoreDebounce);

      return Promise.resolve(valid);
    }

  }

  _asyncValidation(promises) {
    this.setState({ _validating: true });
    let { errorMessage } = this.props;
    let key = null;
    const isValid = result => {
      if (typeof result === "object") {
        // Assign error message if found
        if ("message" in result) {
          errorMessage = result.message;
        }
        if ("key" in result && !result.valid) {
          key = result.key;
        }
        return result.valid;
      } else {
        return !!result; // Treat as boolean / null / undefined
      }
    };

    Promise.all(promises.map(f => f())).then(results => {
      return results.every(result => {
        return isValid(result);
      });
    }, error => {
      // Use error message if valid also sent
      if (error && error.message && "valid" in error) {
        errorMessage = error.message;
      }
      return false;
    })
    .then(valid => {
      // Finished processing
      this.setState({ _validating: false });
      this.setValid(valid, errorMessage, key, true);
      return valid;
    });
  }

  @autobind
  handleChange(e) {
    const { currentTarget: { value } } = e;
    this.setValue(value, e);
  }

  render() {
    return null;
  }
}

export default Field;
