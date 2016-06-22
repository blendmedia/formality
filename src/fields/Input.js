import React, { PropTypes } from "react";
import classnames from "classnames";

import Field from "../Field";

class Input extends Field {
  static propTypes = {
    ...Field.propTypes,
    className: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  };

  static defaultProps = {
    ...Field.defaultProps,
    className: "Input",
    type: "text",
  };

  render() {
    const { className: cls, type } = this.props;
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
        <input
          {...this.props}
          className={`${cls}__control`}
          defaultValue={void 0}
          onChange={this.handleChange}
          type={type}
          value={value || ""}
        />
      </div>
    );
  }
}

export default Input;
