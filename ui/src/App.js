import React, {useEffect, useState} from 'react';
import Client from './svc/Fetch'
import {BrowserRouter as Router, Redirect, Route, Switch,} from "react-router-dom";
import Login from './pages/Login'
import ContentBrowser from './pages/ContentBrowser';
import AuthService from "./svc/AuthService";
import AuthorizationState from "./lib/Auth";
import Register from "./pages/Register";
import ConnectionsSvc from "./svc/ConnectionsSvc";
import AccountsSvc from "./svc/AccountsSvc";
import JobsService from "./svc/JobsSvc";
import ResourcesService from "./svc/ResourcesSvc";
import EventsService from "./svc/EventScv";
import ApprovalRequestSvc from "./svc/ApprovalRequestSvc";
import PasswordResetPage from "./pages/PasswordReset";
import PasswordResetSvc from "./svc/PasswordResetSvc";

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
const eventsService = new EventsService(serverClient);
const approvalRequestsService = new ApprovalRequestSvc(serverClient);
const passwordResetService = new PasswordResetSvc(serverClient, authState);

function App() {
    const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
    const [dataVersion, setDataVersion] = useState(0);

    function refreshData() {
        setDataVersion(dataVersion + 1);
    }

    useEffect(() => {
        console.log("Checking for welcome modal");
        const shouldOpenModal = localStorage.getItem('welcomeModal')
        console.log("Stored:", shouldOpenModal)
        if (shouldOpenModal != null) {
            setWelcomeModalOpen(true);
        } else {
            setWelcomeModalOpen(false);
        }
    }, [dataVersion]);

    function clearWelcomeModal() {
        console.log("Clearing")
        localStorage.removeItem('welcomeModal');
        refreshData();
    }

    function setupWelcomeModal() {
        localStorage.setItem('welcomeModal', 'true');
        refreshData();
    }

    return (
        <Router>
            <div style={{height: '100%'}}>
                <Switch>
                    <Route exact path="/register">
                        <Register authService={authService}/>
                    </Route>
                    <Route exact path="/password-reset">
                        <PasswordResetPage passwordResetService={passwordResetService}/>
                    </Route>
                    <Route exact path="/">
                        <Login authService={authService} onFirstLogin={setupWelcomeModal}/>
                    </Route>
                    <LoggedInRoute exact={false} path="/browse/:slug">
                        <ContentBrowser
                            authState={authState}
                            connectionsService={connectionsService}
                            accountsService={accountsService}
                            jobsService={jobsService}
                            resourcesService={resourcesService}
                            eventsService={eventsService}
                            serverClient={serverClient} // todo remove
                            hostname={hostnameWithProtocol}
                            approvalRequestsService={approvalRequestsService}
                            welcomeModalShouldOpen={welcomeModalOpen}
                            onWelcomeModalDismiss={clearWelcomeModal}
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
function LoggedInRoute({children, ...rest}) {
    return (
        <Route
            {...rest}
            render={({location}) =>
                authState.isLoggedIn() ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: {from: location}
                        }}
                    />
                )
            }
        />
    );
}

export default App;
