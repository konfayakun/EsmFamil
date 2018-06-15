import React, { Component } from "react";
import { Input } from "react-materialize";
import "../styles/Home.css";

export default class Home extends Component {
  render() {
    return (
      <div>
        <div className="username_container">
          <Input label="username" onChange={this.handelChange} />
        </div>
      </div>
    );
  }
  handelChange = function(event) {
    window.username = event.target.value;
  };
}
