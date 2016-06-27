import React, { PropTypes } from "react";
import classnames from "classnames";


const PlainInput = ({
  className: cls,
  type = "text",
  value = "",
  error = "",
  errorKey = null,
  onChange = () => {},
  processing = false,
  valid = false,
  invalid = !valid,
  ...props,
}) => {
  return (
    <div
      className={classnames(cls, {
        [`${cls}--error`]: invalid,
        [`${cls}--valid`]: valid,
        [`${cls}--working`]: processing,
        [errorKey ? `${cls}--error--${errorKey}` : false]: invalid,
      })}
    >
      <span className={`${cls}__error`}>{error}</span>
      <input
        {...props}
        children={void 0}
        className={`${cls}__control`}
        defaultValue={void 0}
        onChange={onChange}
        type={type}
        value={value === null ? "" : value}
      />
    </div>
  );
};

PlainInput.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  errorKey: PropTypes.string,
  invalid: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  processing: PropTypes.bool,
  type: PropTypes.string.isRequired,
  valid: PropTypes.bool,
  value: PropTypes.any,
};

export default PlainInput;
