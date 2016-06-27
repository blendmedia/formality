import React from "react";
import { mount, shallow } from "enzyme";

import Input from "../../src/fields/Input";
import PlainInput from "../../src/fields/PlainInput";

describe("<Input /> component", () => {
  it("should render a container with an input element and no error", () => {
    const wrapper = mount(<Input name="username" />);
    expect(wrapper.find("div.Input")).to.have.length(1);
    expect(wrapper.find("input.Input__control")).to.have.length(1);
  });

  it("should update it's value on change of the <input>", () => {
    const value = "my test value";
    const wrapper = shallow(<Input name="username" />);
    const control = wrapper.find(PlainInput);
    control.simulate("change", {
      currentTarget: {
        value,
      },
    });
    expect(wrapper.instance().getValue()).to.equal(value);
  });

  it("should update the input value when setting internal value", () => {
    const value = "my test value";
    const wrapper = shallow(<Input name="a" />);
    wrapper.instance().setValue(value);
    wrapper.update();
    const control = wrapper.find(PlainInput);
    expect(control.prop("value")).to.be.equal(value);
  });

  it("should set an error class when invalid", () => {
    const wrapper = mount(<Input name="a" />);
    wrapper.instance().setValid(false);
    wrapper.update();
    expect(wrapper.find(".Input--error")).to.have.length(1);
  });

  it("should display an error message when invalid", () => {
    const wrapper = mount(<Input name="a" />);
    wrapper.instance().setValid(false, "example error msg");
    wrapper.update();
    expect(wrapper.find(".Input__error")).to.have.length(1);
    expect(wrapper.find(".Input__error").text()).to.equal("example error msg");
  });

  it("should set an working class when pending async changes", () => {
    const Async = () => new Promise(resolve => setTimeout(resolve, 10));
    const wrapper = mount(
      <Input name="a">
        <Async />
      </Input>
    );
    wrapper.instance().validate();
    wrapper.update();
    expect(wrapper.find(".Input--working")).to.have.length(1);
    return new Promise(resolve => {
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.find(".Input--working")).to.have.length(0);
        resolve();
      }, 11);
    });
  });

  it("should set a specific error class when a key is provided", () => {
    const wrapper = mount(<Input name="a" />);
    wrapper.instance().setValid(false, "Field is required", "req");
    wrapper.update();
    expect(wrapper.find(".Input--error--req")).to.have.length(1);
  });
});
