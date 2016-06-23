import React from "react";
import { shallow, mount } from "enzyme";
import { spy } from "sinon";

import Form from "../src/Form.js";
import Field from "../src/Field.js";

describe("<Form /> component", () => {
  it("should render a form with onSubmit bound", () => {
    const wrapper = shallow(<Form />);
    expect(wrapper.is("form")).to.be.true;
    expect(wrapper.prop("onSubmit")).to.be.instanceof(Function);
  });

  it("should prevent default on form submit", () => {
    let e = null;
    const onSubmit = event => e = event;
    const wrapper = mount(<Form onSubmit={onSubmit} />);
    wrapper.simulate("submit");
    expect(e.defaultPrevented).to.be.true;
  });

  it("should initialize state for any fields provided as children", () => {
    const wrapper = mount(
      <Form>
        <Field name="name" />
        <Field name="password" />
      </Form>
    );

    expect(wrapper.state()).to.contain({
      "_field_name_value": null,
      "_field_name_valid": true,
      "_field_name_message": null,
      "_field_password_value": null,
      "_field_password_valid": true,
      "_field_password_message": null,
    });
  });

  it("should update state when child value is updated", () => {
    const wrapper = mount(
      <Form>
        <Field name="name" />
        <Field name="password" />
      </Form>
    );
    const field = wrapper.find(Field).first();
    field.nodes[0].setValue("my username");
    expect(wrapper.state("_field_name_value")).to.equal("my username");
  });

  it("should update state when a child value is validated", () => {
    const Valid = () => true;
    const Invalid = () => false;

    const wrapper = mount(
      <Form>
        <Field errorMessage="incorrect username" name="name">
          <Invalid />
        </Field>
        <Field name="password">
          <Valid />
        </Field>
      </Form>
    );
    const fields = wrapper.find(Field);
    fields.forEach(field => {
      field.nodes[0].validate();
    });
    expect(wrapper.state("_field_name_valid")).to.be.false;
    expect(wrapper.state("_field_password_valid")).to.be.true;
  });

  it("should return valid state only when all children are valid", () => {
    const Valid = () => true;
    const Invalid = () => false;

    const invalidWrapper = mount(
      <Form>
        <Field errorMessage="incorrect username" name="name">
          <Invalid />
        </Field>
        <Field name="password">
          <Valid />
        </Field>
      </Form>
    );
    let fields = invalidWrapper.find(Field);
    fields.forEach(field => {
      field.nodes[0].validate();
    });

    expect(invalidWrapper.instance().isValid()).to.be.false;

    const validWrapper = mount(
      <Form>
        <Field errorMessage="incorrect username" name="name">
          <Valid />
        </Field>
        <Field name="password">
          <Valid />
        </Field>
      </Form>
    );
    fields = validWrapper.find(Field);
    fields.forEach(field => {
      field.nodes[0].validate();
    });

    expect(validWrapper.instance().isValid()).to.be.true;
  });

  it("should be able to retrieve all values from fields", () => {
    const wrapper = mount(
      <Form>
        <Field errorMessage="incorrect username" name="name" />
        <Field name="password" />
      </Form>
    );
    const fields = wrapper.find(Field);
    fields.forEach(field => {
      field.nodes[0].setValue("my value");
    });

    expect(wrapper.instance().values()).to.eql({
      name: "my value",
      password: "my value",
    });
  });

  it("should not call the onSubmit callback when invalid", () => {
    const Invalid = () => false;
    const onSubmit = spy();
    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <Field errorMessage="incorrect username" name="name">
          <Invalid />
        </Field>
      </Form>
    );
    const fields = wrapper.find(Field);
    fields.forEach(field => {
      field.nodes[0].validate();
    });
    wrapper.simulate("submit");
    expect(onSubmit.called).to.be.false;
  });

  it("should call the onSubmit callback when valid", () => {
    const Valid = () => true;
    const onSubmit = spy();
    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <Field errorMessage="incorrect username" name="name">
          <Valid />
        </Field>
      </Form>
    );
    const fields = wrapper.find(Field);
    fields.forEach(field => {
      field.nodes[0].validate();
    });
    wrapper.simulate("submit");
    expect(onSubmit.called).to.be.true;
  });

  it("should call the onSubmit callback when submitOnInvalid is true", () => {
    const Invalid = () => false;
    const onSubmit = spy();
    const wrapper = mount(
      <Form onSubmit={onSubmit} submitOnInvalid={true}>
        <Field errorMessage="incorrect username" name="name">
          <Invalid />
        </Field>
      </Form>
    );
    const fields = wrapper.find(Field);
    fields.forEach(field => {
      field.nodes[0].validate();
    });
    wrapper.simulate("submit");
    expect(onSubmit.called).to.be.true;
  });
});
