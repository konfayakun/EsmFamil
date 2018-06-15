import React, { Component } from "react";
import List from "../components/List";
import ComplainList from "../components/ComplainList";
import Strings from "../resources/Strings";
import "../styles/App.css";
import { Modal } from "react-materialize";
export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      glassPane: <div className="glass_pane invisible" />, //this is complain div that will show when a player send stop request to server
      currentLetter: this.props.letter
    };
    //binding this to class methods
    this.stopCallback = this.stopCallback.bind(this);
    this.complainComplete = this.complainComplete.bind(this);
  }
  // this will be called when "stoped" message comes from server
  stopCallback(data, serverSocket) {
    //add complain carts to complain div
    this.setState({
      glassPane: (
        <div className="glass_pane">
          <ComplainList
            parts={Strings.GAME_PARTS}
            letter={this.state.currentLetter}
            values={data}
            serverSocket={serverSocket}
            callback={this.complainComplete}
          />
        </div>
      )
    });
  }
  complainComplete() {
    //hiding complain div after complain process ends
    this.setState({ glassPane: <div className="glass_pane invisible" /> });
    window.$("#com").modal("open"); // show complain complete modal
  }
  render() {
    return (
      <div className="App">
        <List
          parts={Strings.GAME_PARTS}
          letter={this.state.currentLetter}
          values={{}}
          stop={this.stopCallback}
        />
        {this.state.glassPane}
        {/*this is complain compelete modal*/}
        <Modal className="nok" id="com" header={Strings.modal.com.header}>
          {Strings.modal.com.header}
        </Modal>
      </div>
    );
  }
}
