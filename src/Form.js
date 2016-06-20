import React, { PropTypes } from "react";
import { autobind } from "core-decorators";

class Form extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  state = {

  };

  static childContextTypes = {
    getValue: PropTypes.func,
    setValue: PropTypes.func,
    setValid: PropTypes.func,
    getError: PropTypes.func,
    isValid: PropTypes.func,
    register: PropTypes.func,
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
    this.getFieldState(name, "value");
  }

  @autobind
  isFieldValid(name) {
    this.getFieldState(name, "valid");
  }

  @autobind
  getError(name) {
    this.getFieldState(name, "message");
  }

  @autobind
  setFieldValid(name, valid, message) {
    this.setFieldState(name, {
      valid,
      message,
    });
  }

  getChildContext() {
    return {
      register: this.register,
      setValue: this.setValue,
      getValue: this.getValue,
      setValid: this.setFieldValid,
      getError: this.getError,
      isValid: this.isFieldValid,
    };
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  isValid() {
    const vaidMatcher = /^_field_\w+_valid$/;
    for (const key in this.state) {
      if (vaidMatcher.test(key) && !this.state[key]) {
        return false;
      }
    }
    return true;
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.props.children}
      </form>
    );
  }
}

export default Form;
