import React from "react";
import Strings from "../resources/Strings";
import $ from "jquery";
import { Input } from "react-materialize";
export default class InputPart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: this.props.value, state: "pending" };
    this.handelChange = this.handelChange.bind(this);
    this.handleFocuseLost = this.handleFocuseLost.bind(this);
  }
  //change status and update input value
  handelChange(event) {
    this.setState({ value: event.target.value, state: "pending" });
  }
  // change status and fire the callback according to value and invalids and letter
  handleFocuseLost(event) {
    if (!this.state.value) return;
    this.setState({ value: this.state.value.trim() });
    let value = this.state.value;
    if (value === "") {
      this.setState({ state: "pending" });
      this.props.callback(this.props.name, false, value);
    } else if (!value.startsWith(this.props.letter)) {
      this.setState({ state: "invalid" });
      this.props.callback(this.props.name, false, value);
    } else if (this.props.invalids.indexOf(value) !== -1) {
      this.setState({ state: "duplicate" });
      this.props.callback(this.props.name, false, value);
    } else {
      this.setState({ state: "valid" });
      this.props.callback(this.props.name, true, value);
      this.props.server.emit("submit", {
        key: this.props.name,
        value: value.trim()
      });
    }
  }
  //this is a feature. pressing enter on cart will proceed you to the next cart.
  handelEnter(event) {
    if (event.key === "Enter") {
      $("#tab" + (event.target.tabIndex + 1)).focus();
    }
  }

  render() {
    return (
      <div
        className={"outer_container " + this.state.state}
        onClick={this.handleFocuseLost}
      >
        <div className={"inner_container " + this.state.state}>
          <label className="lable">{this.props.name}</label>
          <label className="description">
            {Strings.ITEM_DESCRIPTION} {this.props.letter}
          </label>
          <Input
            className="text_input"
            value={this.state.value}
            onChange={this.handelChange}
            onBlur={this.handleFocuseLost}
            onKeyPress={this.handelEnter}
            tabIndex={this.props.tabIndex}
            id={"tab" + this.props.tabIndex}
          />
        </div>
      </div>
    );
  }
}
