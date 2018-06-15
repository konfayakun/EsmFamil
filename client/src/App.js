import React, { Component } from "react";
import Game from "./components/Game";
import Home from "./components/Home";
import ProLink from "./components/ProLink";
import "./styles/App.css";
import Strings from "./resources/Strings";

import { Route } from "react-router";
//simple router and link
export default class App extends Component {
  render() {
    return (
      <div>
        <nav>
          <ProLink
            exact={false}
            to="/game"
            lable={Strings.START_GAME_LINK_TEXT}
          />
          <ProLink exact={false} to="/" lable="Home Page!" />
        </nav>
        <div>
          <Route path="/game" render={() => <Game className="game" />} />
          <Route exact path="/" component={Home} />
        </div>
      </div>
    );
  }
}
