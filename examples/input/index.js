import React from "react";
import ReactDOM from "react-dom";

import "./styles.styl";
import { Input } from "@thinmartian/formality";

import isEmail from "validator/lib/isEmail";

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

const IsEmail = ({ value }) => {
  if (value && !isEmail(value + "")) {
    return {
      valid: false,
      message: "Please enter a valid email address",
      key: "email",
    };
  }
  return true;
};

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
Async.sync = true;

ReactDOM.render(
  <div>
    <h1>Debounced: Required & Email</h1>
    <Input debounce={300} name="username">
      <Required />
      <IsEmail />
    </Input>
    <h1>Async (Debounced)</h1>
    <Input debounce={300} name="username">
      <Async />
    </Input>
  </div>,
  document.getElementById("app")
);
