/**
 * Generate a validator from a basic boolean function
 * Will return valid on empty values
 * @param  {Function} fn      Function to pass value to
 * @param  {string}   message Optional error message
 * @param  {string}   key     Optional key value for rule
 * @return {Function}         Resulting validator
 */
const compose = (fn, message = null, key = null) => {
  return ({ value }) => {
    if (!value) {
      return true;
    }

    return {
      valid: !!fn(value),
      message,
      key,
    };
  };
};

export default compose;
