import React from "react";
import ReactDOM from "react-dom";

import "./styles.styl";
import { Input, IsEmail, Required } from "@thinmartian/formality";

const Async = ({ value }) => {
  if (!value) {
    return true;
  }
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
    <h1>Debounced: Required & Email</h1>
    <Input debounce={300} name="username">
      <Required />
      <IsEmail />
    </Input>
    <h1>Async (Debounced)</h1>
    <Input debounce={300} name="username">
      <Async message="Username taken" />
    </Input>
    <h1>Validate on Mount</h1>
    <Input
      debounce={300}
      name="username"
      validateOnMount={true}
    >
      <Required />
    </Input>
    <h1>Ignore Debounce: Required & Email</h1>
    <Input debounce={300} name="username">
      <Required noDebounce={true} />
      <IsEmail />
    </Input>
  </div>,
  document.getElementById("app")
);
