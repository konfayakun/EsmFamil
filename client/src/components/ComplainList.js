import React from "react";
import Part from "./OutputPart";
import Strings from "../resources/Strings";
import { Button } from "react-materialize";
export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverSocket: props.serverSocket, //connected socket instace
      items: [], // carts array
      status: {} // carts status (state, value)
    };
    //binding this to class methods
    this.handelComplain = this.handelComplain.bind(this);
    this.partCallback = this.partCallback.bind(this);
    this.finalizedParts = this.finalizedParts.bind(this);
  }

  componentWillMount() {
    //create carts and store them in state
    for (let key of this.props.parts) {
      this.state.items.push(
        <Part
          key={key}
          name={key}
          letter={this.props.letter}
          callback={this.partCallback}
          value={this.props.values[key]}
        />
      );
    }
  }
  //handel Complain button clicked
  handelComplain() {
    //set all carts that not complaind as acceptable carts
    let dummy = this.state.status;
    for (let name in this.props.parts) {
      dummy[this.props.parts[name]] =
        dummy[this.props.parts[name]] || "accepted";
    }
    //replace complain carts with new unclickable carts
    this.finalizedParts();
    this.setState({ status: dummy });
    //send results to server
    this.state.serverSocket.emit("complainResult", dummy);
    // tell parent component complaining process finished
    this.props.callback();
  }
  //replace complain carts with new unclickable carts and new cart status
  finalizedParts() {
    this.state.items = [];
    for (let key of this.props.parts) {
      this.state.items.push(
        <Part
          key={key + "final"}
          name={key}
          letter={this.props.letter}
          value={this.props.values[key]}
          status={this.state.status[key] === "rejected" ? "invalid" : "valid"}
          btnState={this.state.status[key]}
        />
      );
    }
  }
  // this is the handel that carts can tell to this component the complain status. it will pass as a props
  partCallback(name, state) {
    let dummy = this.state.status;
    dummy[name] = state;
    this.setState({ status: dummy });
  }
  //render component
  render() {
    return (
      <div>
        {/* information div */}
        <div
          className="info_container"
          id="spd"
          header={Strings.modal.spd.header}
        >
          {Strings.modal.spd.text}
        </div>
        {/*carts are here */}
        <div className="big_container">{this.state.items}</div>
        {/*stop button container */}
        <div className="stop_container">
          <Button
            waves="purple"
            className="stop_button"
            onClick={this.handelComplain}
            id={"tab" + (this.state.items.length + 1)}
          >
            {Strings.COMPLAIN_BUTTON_TEXT}
          </Button>
        </div>
      </div>
    );
  }
}
