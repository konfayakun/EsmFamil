import React, { Component } from "react";
import { ProgressBar } from "react-materialize";
import Strings from "../resources/Strings";
import "../styles/App.css";

export default class Connecting extends Component {
  render() {
    return (
      <div className="glass_pane loading_div">
        <p>{Strings.connecting_msg}</p>
        <ProgressBar />
      </div>
    );
  }
  handelChange = function(event) {
    window.username = event.target.value;
  };
}
