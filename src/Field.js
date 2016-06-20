import React, { PropTypes } from "react";


class Field extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    debounce: PropTypes.number.isRequired,
    errorMessage: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  static defaultProps = {
    debounce: 0,
    errorMessage: "Invalid data",
  };

  static contextTypes = {
    getValue: PropTypes.func,
    setValue: PropTypes.func,
    setValid: PropTypes.func,
    getError: PropTypes.func,
    isValid: PropTypes.func,
  };

  state = {
    _value: null,
    _valid: null,
    _show: false,
    _message: null,
  };

  getValue() {
    const { name } = this.props;
    return this.context.getValue ?
           this.context.getValue(name) :
           this.state._value;
  }

  setValue(value) {
    const { name } = this.props;
    return this.context.setValue ?
           this.context.setValue(name, value) :
           this.setState({
             _value: value,
           });
  }

  setValid(valid, msg) {
    const { name } = this.props;
    return this.context.setValid ?
           this.context.setValid(name, valid, msg) :
           this.setState({
             _valid: valid,
             _message: valid ? null : msg,
           });
  }

  isValid() {
    const { name } = this.props;
    return this.context.isValid ?
           this.context.isValid(name) :
           this.state._valid;
  }

  error() {
    const { name } = this.props;
    return this.context.getError ?
           this.context.getError(name) :
           this.state._message;
  }

  rules() {
    const { children } = this.props;
    return React.Children.map(children, rule => {
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

  validate() {
    let { errorMessage } = this.props;
    const isValid = result => {
      if (typeof result === "object") {
        // Assign error message if found
        if ("message" in result) {
          errorMessage = result.message;
        }
        return result.valid;
      } else {
        return !!result; // Treat as boolean / null / undefined
      }
    };

    const value = this.getValue();
    let async = false;
    // Resolve all rules as promises
    const promises = [];
    const results = [];



    let valid = true;
    // Iterate over provided rules
    for (const rule of this.rules()) {
      const result = rule.fn({ ...rule.options, value });
      // Separate promises
      if (typeof result.then === "function") {
        async = true;
        promises.push(result);
      } else {
        results.push(result);
        // Exit as soon as we're invalid
        if (!isValid(result)) {
          valid = false;
          break;
        }
      }
    }

    if (async && valid) {
      // Set flag for async processing
      this.setState({ _validating: true });
    }

    // Process promises
    if (valid && async) {
      return Promise.all(promises).then(results => {
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
        this.setValid(valid, errorMessage);

        return valid;
      });
    }

    if (!async || !valid) {
      // Finished processing
      this.setState({ _validating: false });
      this.setValid(valid, errorMessage);

      return Promise.resolve(valid);
    }

  }

  render() {
    return null;
  }
}

export default Field;
