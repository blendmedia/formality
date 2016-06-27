import React, { PropTypes } from "react";

import Field from "../Field";
import PlainInput from "./PlainInput";

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
    return (
      <PlainInput
        {...this.props}
        error={this.error()}
        errorKey={this.errorKey()}
        invalid={this.isValid() === false}
        onChange={this.handleChange}
        processing={this.isProcessing()}
        valid={this.isValid()}
        value={this.getValue()}
      />
    );
  }
}

export default Input;
