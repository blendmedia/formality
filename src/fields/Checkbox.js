import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { autobind } from "core-decorators";

import Field from "../Field";

class Checkbox extends Field {
  static propTypes = {
    ...Field.propTypes,
    checkedValue: PropTypes.any.isRequired,
    className: PropTypes.string.isRequired,
    explicitValue: PropTypes.bool,
    label: PropTypes.string,
  };

  static defaultProps = {
    ...Field.defaultProps,
    className: "Checkbox",
    checkedValue: true,
  };

  clearOnChange = false;

  state = {
    focused: false,
  };

  @autobind
  handleChange(e) {
    const { currentTarget } = e;
    const value = currentTarget.checked ? this.props.checkedValue : false;
    super.handleChange({
      ...e,
      currentTarget: {
        ...currentTarget,
        value,
      },
    });
  }

  @autobind
  handleFocus() {
    this.setState({
      focused: true,
    });
  }

  @autobind
  handleBlur() {
    this.setState({
      focused: false,
    });
  }

  render() {
    const { focused } = this.state;

    const {
      className: cls,
      debounce, // eslint-disable-line no-unused-vars
      errorMessage, // eslint-disable-line no-unused-vars
      checkedValue, // eslint-disable-line no-unused-vars
      label,
      ...props,
    } = this.props;
    let checked = null;

    if (this.props.explicitValue) {
      checked = this.getValue() === this.props.checkedValue;
    } else {
      checked = !!this.getValue();
    }
    const error = this.error();
    const errorKey = this.errorKey();
    const valid = this.isValid() === false;

    return (
      <div
        className={classnames(cls, {
          [`${cls}--error`]: valid,
          [`${cls}--working`]: this.isProcessing(),
          [`${cls}--checked`]: checked,
          [`${cls}--focus`]: focused,
          [errorKey ? `${cls}--error--${errorKey}` : false]: valid,
        })}
      >
        <span className={`${cls}__error`}>{error}</span>
        <label className={`${cls}__label`}>
          <input
            {...props}
            checked={checked}
            children={void 0}
            className={`${cls}__control`}
            defaultValue={void 0}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            type="checkbox"
          />
          {label}
        </label>
      </div>
    );
  }
}

export default Checkbox;
