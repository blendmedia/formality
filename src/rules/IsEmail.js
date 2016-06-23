import isEmail from "validator/lib/isEmail";
import compose from "./compose";

export default compose(
  isEmail,
  "Please provide a valid email address",
  "email"
);
