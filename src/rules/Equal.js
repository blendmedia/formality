const Equal = ({ value, strict, to }) => {
  let valid = true;
  const key = "equal";
  const message = "Value must match";
  if (strict) {
    valid = value === to;
  } else {
    valid = value == to; // eslint-disable-line
  }
  return {
    valid,
    key,
    message,
  };
};

export default Equal;
