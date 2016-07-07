import React, { PropTypes } from "react";
import classnames from "classnames";
import { autobind } from "core-decorators";

import Field from "../Field";

class Checkbox extends Field {
  static propTypes = {
    ...Field.propTypes,
    className: PropTypes.string.isRequired,
    label: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
    ])),
    value: PropTypes.any.isRequired,
  };

  static defaultProps = {
    ...Field.defaultProps,
    className: "Checkbox",
    value: true,
  };

  clearOnChange = false;

  state = {
    focused: false,
  };

  @autobind
  handleChange(e) {
    const { currentTarget } = e;
    const value = currentTarget.checked ? this.props.value : false;
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
    const { className: cls, label } = this.props;
    const checked = !!this.getValue();
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
            {...this.props}
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
