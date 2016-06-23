const Length = ({ value, is, lessThan, greaterThan }) => {
  value = value ? value + "" : ""; // coerce to string
  if (is) {
    return value.length === is;
  }

  const key = "length";
  let valid = true, message = "";
  if (lessThan) {
    valid = value.length < lessThan;
    message = `Must be less than ${lessThan} characters`;
  }

  if (valid && greaterThan) {
    valid = value.length > greaterThan;
    message = `Must be greater than ${lessThan} characters`;
  }

  return {
    valid,
    message,
    key,
  };
};

export default Length;
