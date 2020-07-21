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
import ConnectionsSvc from "./svc/ConnectionsSvc";
import AccountsSvc from "./svc/AccountsSvc";
import JobsService from "./svc/JobsSvc";
import ResourcesService from "./svc/ResourcesSvc";

const hostname = process.env.REACT_APP_HOSTNAME ? process.env.REACT_APP_HOSTNAME : window.location.host;
const protocol = window.location.protocol ? window.location.protocol : 'http:';
const hostnameWithProtocol = `${protocol}//${hostname}`;

console.log("Backend running at", hostnameWithProtocol);

const authState = new AuthorizationState();
const serverClient = new Client(hostnameWithProtocol, authState);
const authService = new AuthService(hostnameWithProtocol, authState, serverClient);
const connectionsService = new ConnectionsSvc(serverClient);
const accountsService = new AccountsSvc(serverClient);
const jobsService = new JobsService(serverClient);
const resourcesService = new ResourcesService(serverClient);

function App() {
  return (
      <Router>
        <div style={{height: '100%'}}>
          <Switch>
            <Route exact path="/register">
              <Register authService={authService}/>
            </Route>
            <Route exact path="/">
              <Login authService={authService}/>
            </Route>
            <LoggedInRoute path="/browse/:slug">
                <ContentBrowser
                    authState={authState}
                    connectionsService={connectionsService}
                    accountsService={accountsService}
                    jobsService={jobsService}
                    resourcesService={resourcesService}
                />
            </LoggedInRoute>
            <Route><Redirect to={{pathname: "/browse/connections"}}/></Route>
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
