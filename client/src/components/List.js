import React from "react";
import Part from "./InputPart";
import Connecting from "./Connecting";
import Strings from "../resources/Strings";
import socketIOClient from "socket.io-client";
import { Button, Modal } from "react-materialize";
export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverSocket: {},
      items: [],
      status: {},
      dest: { response: false, endpoint: Strings.SERVER },
      letter: this.props.letter,
      connectingDiv: ""
    };
    //binding this to class methods
    this.handelStop = this.handelStop.bind(this);
    this.partCallback = this.partCallback.bind(this);
  }
  componentDidMount() {
    //connect to server
    const { endpoint } = this.state.dest;
    const socket = socketIOClient(endpoint);
    this.setState({ serverSocket: socket });
    socket.emit("myNameIs", window.username || "Anonymous"); //introducing to server. send username or "Anonymous" when username was not seted
    //"letter" message comes from server.
    socket.on("letter", information => {
      //create carts and store them in state.items
      console.log(information);
      for (let key of this.props.parts) {
        this.state.items.push(
          <Part
            key={key}
            name={key}
            letter={information.chosenLetter}
            invalids={information.invalids.key || []}
            server={socket}
            callback={this.partCallback}
            tabIndex={this.state.items.length + 1}
            value={this.props.values[key]}
          />
        );
      }
      this.setState({ items: this.state.items, connectingDiv: "invisible" });
    });
    //"submited" message comes from server. it means one player submited a valid cart and we must store it in invalids
    socket.on("submited", data => {
      //push the value of submited cart in the maching cart name
      this.setState({
        items: this.state.items.map(part => {
          if (part.key === data.key) {
            part.props.invalids.push(data.value);
          }
          return part;
        })
      });
    });
    //"stoped" message comes from server
    socket.on("stoped", recivedData => {
      let stopper = recivedData.stopper,
        values = recivedData.data;
      this.props.stop(values[stopper], socket); //call stop callback and tell parent component to show complain div
    });
    //"userDisconnected" message comes from server. it means one of users leaves the game and we must delete invalids that comes from his/her carts!
    socket.on("userDisconnected", recivedData => {
      //alter parts and remove old invalids that now are valid
      this.setState({
        items: this.state.items.map(part => {
          for (let field of Object.keys(recivedData)) {
            if (part.key === field) {
              let newInvalids = part.props.invalids.map(invalid => {
                if (invalid !== recivedData[field]) return invalid;
              });
              //alter the cart with newone
              delete this.state.items[field];
              let newPart = (
                <Part
                  key={field}
                  name={field}
                  letter={this.state.letter}
                  invalids={newInvalids}
                  server={socket}
                  callback={this.partCallback}
                  tabIndex={this.state.items.length + 1}
                  value={this.props.values[field]}
                />
              );
              return newPart;
            }
          }
          return part;
        })
      });
    });
    //"unsuccessfulStop" comes from server. it means stopper's one or more carts status turns to invalid by complain process.
    socket.on("unsuccessfulStop", recivedData => {
      this.setState({
        //add new invalids to carts
        items: this.state.items.map(part => {
          for (let field of Object.keys(recivedData)) {
            if (part.key === field) {
              recivedData[field].forEach(invalid => {
                part.props.invalids.push(invalid);
              });
            }
          }
          return part;
        })
      });
      window.$("#uns").modal("open"); //show "unsuccessful stop" modal to stopper.
    });
    //"resume" message comes from server
    socket.on("resume", recivedData => {
      //add new invalids to carts
      this.setState({
        items: this.state.items.map(part => {
          for (let field of Object.keys(recivedData)) {
            if (part.key === field) {
              recivedData[field].forEach(invalid => {
                part.props.invalids.push(invalid);
              });
            }
          }
          return part;
        })
      });
      window.$("#res").modal("open"); //show resume modal, it means stop was unsuccessful and the game is going on
    });
    //"lose" message comes from server
    socket.on("lose", name => {
      this.setState({ winner: name.split(":")[1] }); //extract name of user from username
      window.$("#los").modal("open"); //show lose modal
    });
    socket.on("win", () => {
      window.$("#win").modal("open"); //show win modal
    });
  }
  // stop button action
  handelStop() {
    //check true state of all carts
    let complete = true;
    for (let name in this.state.status) {
      complete &= this.state.status[name].state;
    }
    if (
      complete &&
      Object.keys(this.state.status).length === this.state.items.length
    ) {
      let serverObject = {};
      for (let name in this.state.status) {
        serverObject[name] = this.state.status[name].value;
      }
      //send stop request to server
      this.state.serverSocket.emit("stop", serverObject);
      window.$("#sto").modal("open"); // show stop modal
    } else {
      window.$("#nok").modal("open"); // show invalid stop modal. one or more carts are not valid
    }
  }
  //this is the handel that part will execute when a carts status changes
  partCallback(name, state, value) {
    let dummy = this.state.status;
    dummy[name] = { state: state, value: value };
    this.setState({ status: dummy });
  }
  render() {
    return (
      <div>
        <div className={this.state.connectingDiv}>
          <Connecting />
        </div>
        {/*this is legend div*/}
        <div className="legend">
          <div className="valid">{Strings.legend.valid}</div>
          <div className="invalid">{Strings.legend.invalid}</div>
          <div className="duplicate">{Strings.legend.duplicate}</div>
        </div>
        {/*carts are here*/}
        <div className="big_container">{this.state.items}</div>
        <div className="stop_container">
          <Button
            className="stop_button"
            onClick={this.handelStop}
            id={"tab" + (this.state.items.length + 1)}
            waves="light"
          >
            {Strings.STOP_BUTTON_TEXT}
          </Button>
        </div>
        {/*this is invalid stop modal*/}
        <Modal className="nok" id="nok" header={Strings.modal.nok.header}>
          {Strings.modal.nok.text}
        </Modal>
        {/*this is unsuccessful stop modal*/}
        <Modal className="nok" id="uns" header={Strings.modal.uns.header}>
          {Strings.modal.uns.text}
        </Modal>
        {/*this is stop modal*/}
        <Modal className="nok" id="sto" header={Strings.modal.sto.header}>
          {Strings.modal.sto.text}
        </Modal>
        {/*this is resume modal*/}
        <Modal className="nok" id="res" header={Strings.modal.res.header}>
          {Strings.modal.res.text}
        </Modal>
        {/*this is lose modal*/}
        <Modal className="nok" id="los" header={Strings.modal.los.header}>
          {Strings.modal.los.text.replace("@", this.state.winner)}
        </Modal>
        {/*this is win modal*/}
        <Modal className="nok" id="win" header={Strings.modal.win.header}>
          {Strings.modal.win.text}
        </Modal>
      </div>
    );
  }
}
