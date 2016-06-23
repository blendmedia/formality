const Required = ({ value }) => {
  return {
    valid: !!value,
    key: "required",
    message: "This field is required",
  };
};

export default Required;
