import React from "react";
import { shallow } from "enzyme";
import { spy } from "sinon";

import Field from "../src/Field";

const MyFunc = () => true;
class MyClass extends React.Component {}

describe("<Field /> component", () => {
  it("should render null", () => {
    const wrapper = shallow(
      <Field name="example" />
    );
    expect(wrapper.node).to.be.null;
  });

  it("should initial state correctly", () => {
    const wrapper = shallow(
      <Field name="example" />
    );
    expect(wrapper.state()).to.have.property("_value");
    expect(wrapper.instance().getValue()).to.be.equal(null);
  });

  it("should be able to set it's own value", () => {
    const wrapper = shallow(
      <Field name="example" />
    );
    wrapper.instance().setValue("test value");
    expect(wrapper.state("_value")).to.be.eql("test value");
    expect(wrapper.instance().getValue()).to.be.eql("test value");
  });

  it("should only accept function rules", () => {
    const wrapper = shallow(
      <Field name="example">
        <MyFunc />
        <MyClass />
        <button />
      </Field>
    );

    expect(wrapper.instance().rules()).to.have.length(2);
  });

  it("should stop processing rules as soon as one is invalid", () => {
    const Invalid = spy(() => false);
    const Valid = spy(() => true);
    const wrapper = shallow(
      <Field name="example">
        <Invalid />
        <Valid />
      </Field>
    );

    wrapper.instance().validate();
    expect(Invalid.called).to.be.true;
    expect(Valid.called).to.be.false;
  });

  it("should continue running validation when a promise is encountered", () => {
    const InvalidPromise = spy(() => Promise.resolve(false));
    const Valid = spy(() => true);
    const wrapper = shallow(
      <Field name="example">
        <InvalidPromise />
        <Valid />
      </Field>
    );

    wrapper.instance().validate();
    expect(InvalidPromise.called).to.be.true;
    expect(Valid.called).to.be.true;
  });

  it("should run all promises", () => {
    const InvalidPromise = spy(() => Promise.resolve(false));
    const ValidPromise = spy(() => Promise.resolve(true));
    const wrapper = shallow(
      <Field name="example">
        <InvalidPromise />
        <ValidPromise />
      </Field>
    );

    wrapper.instance().validate();
    expect(InvalidPromise.called).to.be.true;
    expect(ValidPromise.called).to.be.true;
  });

  it("should set valid to null if promises are outstanding", () => {
    const InvalidPromise = spy(() => Promise.resolve(false));
    const ValidPromise = spy(() => Promise.resolve(true));
    const wrapper = shallow(
      <Field name="example">
        <InvalidPromise />
        <ValidPromise />
      </Field>
    );
    wrapper.setState({"_valid": true});
    wrapper.instance().validate();
    expect(wrapper.state("_valid")).to.equal(null);
  });

  it("should assign validation according to promise results", () => {
    const InvalidPromise = spy(() => Promise.resolve(false));
    const ValidPromise = spy(() => Promise.resolve(true));
    const wrapper = shallow(
      <Field name="example">
        <ValidPromise />
        <InvalidPromise />
      </Field>
    );

    wrapper.instance().validate();
    setTimeout(() => {
      expect(wrapper.instance().isValid()).to.be.false;
    }, 1);
  });

  it("should set valid to false on a rejected promise", () => {
    const FailedPromise = () => new Promise(() => {
      throw new Error();
    });
    const wrapper = shallow(
      <Field errorMessage="test" name="example">
        <FailedPromise />
      </Field>
    );

    wrapper.instance().validate();
    setTimeout(() => {
      expect(wrapper.instance().isValid()).to.be.false;
      expect(wrapper.instance().error()).to.equal("test");
    }, 1);
  });
  it("should take the error message from props when not supplied", () => {
    const Invalid = () => false;
    const message = "Testing Error Messages";
    const wrapper = shallow(
      <Field errorMessage={message} name="example">
        <Invalid />
      </Field>
    );
    wrapper.instance().validate();
    expect(wrapper.instance().error()).to.eql(message);
  });

  it("should take the error message from the validation response", () => {
    const message = "Testing Error Messages";
    const Invalid = () => ({ valid: false, message });
    const wrapper = shallow(
      <Field name="example">
        <Invalid />
      </Field>
    );
    wrapper.instance().validate();
    expect(wrapper.instance().error()).to.eql(message);
  });

  it("should grab the error message from a rejection", () => {
    const FailedPromise = () => new Promise(() => {
      throw {
        valid: false,
        message: "rejected",
      };
    });
    const wrapper = shallow(
      <Field errorMessage="test" name="example">
        <FailedPromise />
      </Field>
    );

    wrapper.instance().validate();
    setTimeout(() => {
      expect(wrapper.instance().isValid()).to.be.false;
      expect(wrapper.instance().error()).to.equal("rejected");
    }, 1);
  });

  it("should set the _valid state accordingly", () => {
    const Invalid = () => false;
    const Valid = () => true;

    // Test invalid field
    const invalidWrapper = shallow(
      <Field name="example">
        <Invalid />
      </Field>
    );
    invalidWrapper.instance().validate();

    expect(invalidWrapper.instance().isValid()).to.be.false;

    // Test valid field
    const validWrapper = shallow(
      <Field name="example">
        <Valid />
      </Field>
    );
    validWrapper.instance().validate();
    expect(validWrapper.instance().isValid()).to.be.true;
  });

  it("should pass all props back to the validator", () => {
    const Invalid = spy(() => false);
    const wrapper = shallow(
      <Field name="example">
        <Invalid from="example" to="test"  />
      </Field>
    );
    wrapper.instance().validate();
    expect(Invalid.firstCall.args[0]).to.include({
      to: "test",
      from: "example",
    });
  });

  it("should pass (and replace) the current value to the validator", () => {
    const Invalid = spy(() => false);
    const wrapper = shallow(
      <Field name="example">
        <Invalid
          from="example"
          to="test"
          value="wrong"
        />
      </Field>
    );
    wrapper.instance().setValue("Test Value");
    wrapper.instance().validate();
    expect(Invalid.firstCall.args[0]).to.include({
      value: "Test Value",
    });
  });

  it("should not reveal the error message until show is true", () => {
    const message = "Testing Error Messages";
    const Invalid = () => ({ valid: false, message });
    const wrapper = shallow(
      <Field name="example">
        <Invalid />
      </Field>
    );
    wrapper.instance().validate();
    wrapper.setState({"_show": false});
    expect(wrapper.instance().error()).to.eql(null);
  });

  it("should not show the error until elapsed time when using debounce", () => {
    const message = "Testing Error Messages";
    const Invalid = () => ({ valid: false, message });
    const wrapper = shallow(
      <Field debounce={10} name="example">
        <Invalid />
      </Field>
    );
    wrapper.instance().validate();
    expect(wrapper.instance().error()).to.eql(null);

    // debounce on npm doesn't work with sinon timers
    return new Promise(resolve => {
      setTimeout(() => {
        expect(wrapper.instance().error()).to.eql(message);
        resolve();
      }, 11);
    });
  });

  it("should not listen out for promises until debounce has passed", () => {
    const Invalid = () => Promise.resolve(true);
    const wrapper = shallow(
      <Field debounce={10} name="example">
        <Invalid />
      </Field>
    );
    wrapper.instance().validate();

    // debounce on npm doesn't work with sinon timers
    return new Promise(resolve => {
      setTimeout(() => {
        expect(wrapper.state("_valid")).to.equal(null);
        setTimeout(() => {
          expect(wrapper.state("_valid")).to.equal(true);
          resolve();
        }, 11);
      }, 1);
    });
  });

  it([
    "should not run async functions if it is passed as",
    "an attribute/prop until debounce is fired",
  ].join(" "), () => {
    const InvalidWithAttribute = spy(() => Promise.resolve(true));
    InvalidWithAttribute.async = true;
    const InvalidWithProp = spy(() => Promise.resolve(true));
    const wrapper = shallow(
      <Field debounce={10} name="example">
        <InvalidWithProp async={true} />
        <InvalidWithAttribute />
      </Field>
    );
    wrapper.instance().validate();
    expect(InvalidWithAttribute.called).to.be.false;
    expect(InvalidWithProp.called).to.be.false;
    return new Promise(resolve => {
      setTimeout(() => {
        expect(InvalidWithAttribute.called).to.be.true;
        expect(InvalidWithProp.called).to.be.true;
        resolve(true);
      }, 11);
    });
  });

  it("should set valid value immediately regardless of debounce", () => {
    const message = "Testing Error Messages";
    const Invalid = () => ({ valid: false, message });
    const wrapper = shallow(
      <Field debounce={300} name="example">
        <Invalid />
      </Field>
    );
    wrapper.instance().validate();
    expect(wrapper.state("_valid")).to.equal(false);
  });

  it("should retrieve the key of the rule that was rejected", () => {
    const Invalid = () => ({ valid: false, key: "req" });
    const wrapper = shallow(
      <Field debounce={300} name="example">
        <Invalid />
      </Field>
    );
    wrapper.instance().validate();
    expect(wrapper.state("_invalid_on")).to.equal("req");
  });
});
