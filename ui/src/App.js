import React from 'react';
import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Login from './pages/Login'
import AuthService from "./svc/AuthService";
import AuthorizationState from "./lib/Auth";
import FetchDefaults from "./svc/FetchDefaults";

const hostname = process.env.REACT_APP_HOSTNAME ? process.env.REACT_APP_HOSTNAME : window.location.host;
const hostnameWithProtocol = `http://${hostname}`;

const authState = new AuthorizationState();
const authService = new AuthService(hostnameWithProtocol, authState, FetchDefaults);

function App() {
  return (
      <Router>
        <div>
          {/*<nav>*/}
          {/*  <ul>*/}
          {/*    <li>*/}
          {/*      <Link to="/">Home</Link>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <Link to="/about">About</Link>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <Link to="/users">Users</Link>*/}
          {/*    </li>*/}
          {/*  </ul>*/}
          {/*</nav>*/}

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>

            <Route exact path="/register">
              <div>Create Account</div>
            </Route>
            <Route exact path="/users">
              <div>Users</div>
            </Route>
            <Route exact path="/">
              <Login authService={authService}/>
            </Route>
            <Route><div>404</div></Route>


          </Switch>
        </div>
      </Router>
  );
}

export default App;
