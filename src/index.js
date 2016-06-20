global.process = process || {};
process.env = process.env || {};
process.env.NODE_ENV = process.env.NODE_ENV || "production";

export Form from "./Form";
export Field from "./Field";
export * from "./rules";
