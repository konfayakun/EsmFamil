import React from "react";
import Strings from "../resources/Strings";
import { Icon } from "react-materialize";
export default class OutputPart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: this.props.status || "pending",
      btnState: this.props.btnState || ""
    };
    this.handelClick = this.handelClick.bind(this);
  }
  //handel user click on cart to accept or reject an answer. set state and fire callback.
  handelClick(event) {
    if (!this.props.callback) return;
    if (event.target.id === "accept") {
      this.setState({
        state: "valid",
        btnState: "accepted"
      });
      this.props.callback(this.props.name, "accepted");
    } else if (event.target.id === "reject") {
      this.setState({
        state: "invalid",
        btnState: "rejected"
      });
      this.props.callback(this.props.name, "rejected");
    }
  }
  render() {
    return (
      <div className={"outer_container " + this.state.state}>
        <div
          id={"reject"}
          className={"reject " + this.state.btnState}
          onClick={this.handelClick}
        >
          <div className="icon-container">
            <Icon left bottom>
              thumb_down
            </Icon>
          </div>
        </div>
        <div
          id={"accept"}
          className={"accept " + this.state.btnState}
          onClick={this.handelClick}
        >
          <div className="icon-container">
            <Icon right bottom>
              thumb_up
            </Icon>
          </div>
        </div>
        <div className={"inner_container"}>
          <label className="lable">{this.props.name}</label>
          <label className="description">
            {Strings.ITEM_DESCRIPTION} {this.props.letter}
          </label>
          <label className="text_output">{this.props.value}</label>
        </div>
      </div>
    );
  }
}
