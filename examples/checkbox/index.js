import React from "react";
import ReactDOM from "react-dom";

import "./styles.styl";
import { Checkbox } from "@thinmartian/formality";

const Required = ({ value }) => {
  if (value) {
    return true;
  }

  return {
    valid: false,
    message: "This field is required",
    key: "req",
  };
};

const Async = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        valid: false,
        message: "Server rejected input",
        key: "async",
      });
    }, 1000);
  });
};
Async.async = true;

ReactDOM.render(
  <div>
    <h1>Required</h1>
    <Checkbox
      label="Accept T&Cs"
      name="username"
    >
      <Required message="Please accept the terms & conditions" />
    </Checkbox>
    <h1>Async (Debounced)</h1>
    <Checkbox
      debounce={300}
      label="Send data anonymously"
      name="username"
    >
      <Async />
    </Checkbox>
    <h1>Validate on Mount</h1>
    <Checkbox
      debounce={300}
      label="Confirm participation"
      name="username"
      validateOnMount={true}
    >
      <Required />
    </Checkbox>
  </div>,
  document.getElementById("app")
);
