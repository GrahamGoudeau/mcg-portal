import React from 'react';
import Client from './svc/Fetch'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Login from './pages/Login'
import ContentBrowser from './pages/ContentBrowser';
import AuthService from "./svc/AuthService";
import AuthorizationState from "./lib/Auth";
import Register from "./pages/Register";

const hostname = process.env.REACT_APP_HOSTNAME ? process.env.REACT_APP_HOSTNAME : window.location.host;
const hostnameWithProtocol = `http://${hostname}`;

const authState = new AuthorizationState();
const serverClient = new Client(authState);
const authService = new AuthService(hostnameWithProtocol, authState, serverClient);


function App() {
  return (
      <Router>
        <div>
          <Switch>
            <Route exact path="/register">
              <Register authService={authService}/>
            </Route>
            <Route exact path="/">
              <Login authService={authService}/>
            </Route>
            <LoggedInRoute exact path="/browse">
                <ContentBrowser authState={authState}/>
            </LoggedInRoute>
            <Route><Redirect to={{pathname: "/browse"}}/></Route>
          </Switch>
        </div>
      </Router>
  );
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function LoggedInRoute({ children, ...rest }) {
  return (
      <Route
          {...rest}
          render={({ location }) =>
              authState.isLoggedIn() ? (
                  children
              ) : (
                  <Redirect
                      to={{
                        pathname: "/",
                        state: { from: location }
                      }}
                  />
              )
          }
      />
  );
}

export default App;
