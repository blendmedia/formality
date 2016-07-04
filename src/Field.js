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
    getErrorKey: PropTypes.func,
    isValid: PropTypes.func,
    register: PropTypes.func,
    getAllValues: PropTypes.func,
  };

  state = {
    _value: null,
    _valid: null,
    _show: false,
    _message: null,
    _validating: false,
  };

  clearOnChange = true;

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
    if (this.context.setValue) {
      this.context.setValue(name, value);
    } else {
      this.setState({
        _value: value,
      });
    }

    if (this.clearOnChange) {
      this.show(false);
    }

    this.validate(value);

    if (this.props.onChange) {
      const e = { currentTarget: {}, target: {}, ...event};
      e.currentTarget = { ...e.currentTarget, value };
      e.target = { ...e.target, value };
      this.props.onChange(e);
    }
  }

  setValid(valid, msg = null, key = null, ignoreDebounce = false) {
    const { name } = this.props;
    if (ignoreDebounce) {
      this._show(valid === false);
    } else {
      this.show(valid === false);
    }
    return this.context.setValid ?
           this.context.setValid(name, valid, msg, key) :
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
    if (!this.state._show) {
      return null;
    }

    const { name } = this.props;
    return this.context.getErrorKey ? this.context.getErrorKey(name) :
                                      this.state._invalid_on;
  }

  rules() {
    const { children } = this.props;
    return React.Children.toArray(children).map(rule => {
      const validator = rule.type;
      if (typeof validator === "function") {
        return {
          fn: validator,
          __opts: {...rule.props},
        };
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn("Rule supplied is not a function");
        }
        return null;
      }
    }).filter(rule => !!rule);
  }

  process(result, { message, key }) {
    if (typeof result === "object") {
      // Determine message & key values
      message = message || result.message || this.props.errorMessage;
      key = result.key || key;
      return {
        message,
        key,
        valid: !!result.valid,
      };
    } else {
      return {
        valid: !!result,
        message: message || this.props.errorMessage,
        key,
      };
    }
  }

  validate(value = this.getValue(), ignoreDebounce = false) {
    let async = false;

    const promises = [];
    const rules = this.rules();
    const all = this.context.getAllValues ? this.context.getAllValues() : {};

    // No rules = always valid
    if (!rules.length) {
      this.setValid(true);
      return;
    }

    let { valid, message, key } = { valid: true };
    // Iterate over provided rules
    for (const rule of rules) {
      // Separate promises
      if (rule.fn.async || rule.__opts.async) {
        async = true;
        promises.push(() =>
          Object.assign(rule.fn({ ...rule.__opts, value, all }), {
            "__opts": rule.__opts,
          })
        );
      } else {
        const result = rule.fn({ ...rule.__opts, value, all });
        if (typeof result.then === "function") {
          async = true;
          promises.push(() => Object.assign(result, {
            "__opts": rule.__opts,
          }));
        } else {
          ({ valid, message, key } = this.process(result, rule.__opts, all));
          // Exit as soon as we're invalid
          if (!valid) {
            if (rule.fn.noDebounce || rule.__opts.noDebounce) {
              ignoreDebounce = true;
            }
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
      return;
    }

    if (!async || !valid) {
      // Finished processing
      this.setState({ _validating: false });
      this.setValid(valid, message, key, ignoreDebounce);
      return Promise.resolve(valid);
    }

    if (valid) {
      this.setValid(true);
    }

  }

  _asyncValidation(promises) {
    this.setState({ _validating: true });
    promises = promises.map(f => f());
    Promise.all(promises).then(results => {
      for (const [index, result] of results.entries()) {
        const state = this.process(result, promises[index]);
        if (!state.valid) {
          return state;
        }
      }

      return {
        valid: true,
      };
    }, error => {
      return {
        valid: false,
        message: error.message || this.props.errorMessage,
      };
    })
    .then(({ valid, message, key }) => {
      // Finished processing
      this.setState({ _validating: false });
      this.setValid(valid, message, key, true);
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
