global.process = process || {};
process.env = process.env || {};
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

export Form from "./Form";
export Field from "./Field";
export Input from "./fields/Input";
