import React, { PropTypes } from "react";
import classnames from "classnames";
import { autobind } from "core-decorators";

class Form extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onSubmit: PropTypes.func.isRequired,
    submitOnInvalid: PropTypes.bool,
  };

  static defaultProps = {
    onSubmit: () => {},
    submitOnInvalid: false,
  };

  state = {

  };

  static childContextTypes = {
    getValue: PropTypes.func,
    setValue: PropTypes.func,
    setValid: PropTypes.func,
    getError: PropTypes.func,
    getErrorKey: PropTypes.func,
    isValid: PropTypes.func,
    register: PropTypes.func,
    getAllValues: PropTypes.func,
  };

  setFieldState(name, keys, value) {
    if (typeof keys === "string") {
      keys = {
        [keys]: value,
      };
    }

    const newState = {};
    for (const key in keys) {
      newState[`_field_${name}_${key}`] = keys[key];
    }
    this.setState(newState);
  }

  getFieldState(name, keys) {
    if (typeof keys === "string") {
      return this.state[`_field_${name}_${keys}`];
    } else {
      const state = {};
      for (const key of keys) {
        state[key] = this.state[`_field_${name}_${key}`];
      }
      return state;
    }
  }

  @autobind
  register(name) {
    this.setFieldState(name, {
      "value": null,
      "message": null,
      "valid": null,
    });
  }

  @autobind
  setValue(name, value) {
    this.setFieldState(name, "value", value);
  }

  @autobind
  getValue(name) {
    return this.getFieldState(name, "value");
  }

  @autobind
  isFieldValid(name) {
    return this.getFieldState(name, "valid");
  }

  @autobind
  getError(name) {
    return this.getFieldState(name, "message");
  }

  @autobind
  getErrorKey(name) {
    return this.getFieldState(name, "error_key");
  }

  @autobind
  setFieldValid(name, valid, message, error_key) {
    this.setFieldState(name, {
      valid,
      message,
      error_key,
    });
  }

  getChildContext() {
    return {
      register: this.register,
      setValue: this.setValue,
      getValue: this.getValue,
      setValid: this.setFieldValid,
      getError: this.getError,
      getErrorKey: this.getErrorKey,
      isValid: this.isFieldValid,
      getAllValues: this.values,
    };
  }



  @autobind
  handleSubmit(e) {
    e.preventDefault();
    const { onSubmit, submitOnInvalid } = this.props;
    if ((submitOnInvalid || this.isValid()) && onSubmit) {
      onSubmit({ ...e, data: this.values() });
    }
  }

  isValid() {
    const validMatcher = /^_field_\w+_valid$/;
    for (const key in this.state) {
      if (validMatcher.test(key) && !this.state[key]) {
        return false;
      }
    }
    return true;
  }

  @autobind
  values() {
    const data = {};
    const valueMatcher = /^_field_(\w+)_value$/;
    for (const key in this.state) {
      const matches = key.match(valueMatcher);
      if (!matches) {
        continue;
      }
      data[matches[1]] = this.state[key];
    }
    return data;
  }

  render() {
    const valid = this.isValid();
    return (
      <form
        className={classnames("Formality", {
          "Formality--valid": valid,
          "Formality--invalid": !valid,
        })}
        onSubmit={this.handleSubmit}
      >
        {this.props.children}
      </form>
    );
  }
}

export default Form;
