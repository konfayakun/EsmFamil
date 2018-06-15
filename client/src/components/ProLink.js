import React from "react";
import { Route, Link } from "react-router-dom";
import "../styles/prolink.css";
//this is a ordinary link but dissapears when browser is in exact link
const ProLink = ({ lable, to, exact }) => (
  <Route
    path={to}
    exact={exact}
    children={({ match }) => (
      <div className={match ? "active-link" : ""}>
        {match ? "> " : ""}
        <Link to={to}>{lable}</Link>
      </div>
    )}
  />
);
export default ProLink;
