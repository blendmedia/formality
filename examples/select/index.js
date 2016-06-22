import React from "react";
import ReactDOM from "react-dom";

import "./styles.styl";
import { Select } from "@thinmartian/formality";

import isEmail from "validator/lib/isEmail";

const options = [
  "",
  "John Doe",
  {
    label: "Alex",
    value: "alex",
  },
  {
    label: "Example Email",
    value: "example@email.com",
  },
];

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
    <h1>Required & Email</h1>
    <Select
      name="username"
      options={options}
    >
      <Required />
      <IsEmail />
    </Select>
    <h1>Async (Debounced)</h1>
    <Select
      debounce={300}
      name="username"
      options={options}
    >
      <Async />
    </Select>
    <h1>Validate on Mount</h1>
    <Select
      debounce={300}
      name="username"
      options={options}
      validateOnMount={true}
    >
      <Required />
    </Select>
    <h1>Ignore Debounce: Required & Email</h1>
    <Select
      debounce={300}
      name="username"
      options={options}
    >
      <Required noDebounce={true} />
      <IsEmail />
    </Select>
  </div>,
  document.getElementById("app")
);
