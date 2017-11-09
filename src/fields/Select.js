import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

import Field from "../Field";

class Select extends Field {
  static propTypes = {
    ...Field.propTypes,
    className: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
    ])).isRequired,
    type: PropTypes.string.isRequired,
  };

  static defaultProps = {
    ...Field.defaultProps,
    className: "Select",
  };

  clearOnChange = false;

  componentDidMount() {
    super.componentDidMount();
    if (!this.props.defaultValue && this.props.validateOnMount) {
      const first = this.props.options[0] || "";
      if (first) {
        this.setValue(typeof first === "string" ? first : first.value);
      }
    }
  }

  componentWillReceiveProps(newProps) {
    super.componentDidMount();
    if (!newProps.defaultValue && this.props.validateOnMount) {
      const first = newProps.options[0] || "";
      this.setValue(typeof first === "string" ? first : first.value);
    }
  }

  render() {
    const { className: cls, options } = this.props;
    const value = this.getValue();
    const error = this.error();
    const errorKey = this.errorKey();
    const valid = this.isValid() === false;

    return (
      <div
        className={classnames(cls, {
          [`${cls}--error`]: valid,
          [`${cls}--working`]: this.isProcessing(),
          [errorKey ? `${cls}--error--${errorKey}` : false]: valid,
        })}
      >
        <span className={`${cls}__error`}>{error}</span>
        <select
          {...this.props}
          className={`${cls}__control`}
          defaultValue={void 0}
          onChange={this.handleChange}
          value={value || ""}
        >
          {options.map((opt, index) => (
            <option
              key={index}
              value={typeof opt === "string" ? opt : opt.value}
            >
             {typeof opt === "string" ? opt : opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default Select;
