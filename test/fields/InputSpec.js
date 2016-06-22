import React from "react";
import { shallow, mount } from "enzyme";

import Input from "../../src/fields/Input";

describe("<Input /> component", () => {
  it("should render a container with an input element and no error", () => {
    const wrapper = shallow(<Input name="username" />);
    expect(wrapper.is("div.Input")).to.be.true;
    expect(wrapper.find("input.Input__control")).to.have.length(1);
  });

  it("should update it's value on change of the <input>", () => {
    const value = "my test value";
    const wrapper = shallow(<Input name="username" />);
    const control = wrapper.find("input");
    control.simulate("change", {
      currentTarget: {
        value,
      },
    });
    expect(wrapper.instance().getValue()).to.equal(value);
  });

  it("should update the input value when setting internal value", () => {
    const value = "my test value";
    const wrapper = mount(<Input name="a" />);
    const control = wrapper.find("input");
    wrapper.instance().setValue(value);
    expect(control.prop("value")).to.be.equal(value);
  });

  it("should set an error class when invalid", () => {
    const wrapper = shallow(<Input name="a" />);
    wrapper.instance().setValid(false);
    wrapper.update();
    expect(wrapper.is(".Input--error")).to.be.true;
  });

  it("should display an error message when invalid", () => {
    const wrapper = shallow(<Input name="a" />);
    wrapper.instance().setValid(false, "example error msg");
    wrapper.update();
    expect(wrapper.find(".Input__error")).to.have.length(1);
    expect(wrapper.find(".Input__error").text()).to.equal("example error msg");
  });

  it("should set an error class when pending async changes", () => {
    const Async = () => new Promise(resolve => setTimeout(resolve, 10));
    const wrapper = shallow(
      <Input name="a">
        <Async />
      </Input>
    );
    wrapper.instance().validate();
    wrapper.update();
    expect(wrapper.is(".Input--working")).to.be.true;
    return new Promise(resolve => {
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.is(".Input--working")).to.be.false;
        resolve();
      }, 11);
    });
  });

  it("should set a specific error class when a key is provided", () => {
    const wrapper = shallow(<Input name="a" />);
    wrapper.instance().setValid(false, "Field is required", "req");
    wrapper.update();
    expect(wrapper.is(".Input--error--req")).to.be.true;
  });
});
