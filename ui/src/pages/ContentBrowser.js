import React, {useEffect, useRef, useState} from 'react';
import {
    Switch,
    Route,
    Redirect,
    useHistory,
    useRouteMatch,
} from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../lib/Style'
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import EventIcon from '@material-ui/icons/Event';
import BusinessIcon from '@material-ui/icons/Business';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DashboardIcon from '@material-ui/icons/Dashboard';
import HelpIcon from '@material-ui/icons/Help';
import Connections from './Connections';
import Events from "./Events";
import AddEvent from "./AddEvent";
import Dashboard from "./Dashboard";
import MyAccount from "../pages/MyAccount"
import JobPostings from "../pages/JobPostings"
import NewJobPosting from './NewJobPosting';
import CurrentJob from "../pages/CurrentJob";
import CurrentAccount from './CurrentAccount';
import ChangeInfo from './ChangeInfo'

import EventDetails from "./EventDetails";
import getContactEmail from "../lib/Contact";


const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
    },
    menuButton: {
    },
    title: {
        flexGrow: 1,
        fontFamily: Style.FontFamily,
    },
    bar: {
        background: Style.Blue,
    },
}));



function ContentBrowser(props) {
    const classes = useStyles();
    const history = useHistory();
    const bull = <span className={classes.bullet}>•</span>;
    const textInput = useRef(null);
    const [numPendingApprovals, setNumPendingApprovals] = useState(0);

    const pageTitles = {
        'connections': 'Find Resources',
        'admin': 'Admin Dashboard',
        'jobs': 'Jobs',
        'events': 'Events',
        'me': 'Account',
        'help': 'Help',
    };

    const [pageTitle, setPageTitle] = useState(pageTitles['connections']);

    const match = useRouteMatch({
        path: '/browse/:slug/',
    });

    const computedPageTitle = pageTitles[match.params.slug];
    if (computedPageTitle && computedPageTitle !== pageTitle) {
        setPageTitle(computedPageTitle);
    }

    const [navDrawerOpen, setNavDrawerOpen] = useState(false);

    function logOut() {
        props.authState.setBearerToken('', '');
        history.push('/');
    }

    async function selectNavBarButton(title, path) {
        history.push(path);
        setNavDrawerOpen(false);
        setPageTitle(pageTitles[title]);
    }

    useEffect(() => {
        if (!props.authState.isAdmin() || !navDrawerOpen) {
            return
        }

        props.approvalRequestsService
            .getAllApprovalRequests()
            .then(allReqs => setNumPendingApprovals(allReqs.length))
    }, [props.approvalRequestsService, navDrawerOpen]);

    let connectionsDashboard = null;
    if (props.authState.isAdmin()) {
        connectionsDashboard = <ListItem button key="Admin Dashboard" onClick={() => selectNavBarButton("admin", "/browse/admin")}>
            <ListItemIcon><DashboardIcon/></ListItemIcon>
            <ListItemText className={classes.root} disableTypography>
                Admin <span
                    style={{display: numPendingApprovals > 0 ? 'inline' : 'none', color: 'red'}}
                >
                    ({numPendingApprovals} task{numPendingApprovals > 1 ? 's' : ''})
                </span>
            </ListItemText>
        </ListItem>
    }

    return (
        <div style={{height: '100%'}}>
            <AppBar position="static">
                <Toolbar className={classes.bar}>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={() => setNavDrawerOpen(!navDrawerOpen)}>
                        <MenuIcon/>
                    </IconButton>
                    <Drawer anchor="left" open={navDrawerOpen} onClose={() => setNavDrawerOpen(false)}>
                        <div role="presentation">
                            <List>
                                <ListItem button key="Connections" onClick={() => selectNavBarButton("connections",
                                    "/browse/connections")}>
                                    <ListItemIcon><EmojiPeopleIcon/></ListItemIcon>
                                    <ListItemText className={classes.root} disableTypography primary="Connections"/>
                                </ListItem>
                                <ListItem button key="Event" onClick={() => selectNavBarButton("events",
                                    "/browse/events")}>
                                    <ListItemIcon><EventIcon/></ListItemIcon>
                                    <ListItemText className={classes.root} disableTypography primary="Events"/>
                                </ListItem>
                                <ListItem button key="Jobs" onClick={() => selectNavBarButton("jobs",
                                    "/browse/jobs")}>
                                    <ListItemIcon><BusinessIcon/></ListItemIcon>
                                    <ListItemText className={classes.root} disableTypography primary="Jobs"/>
                                </ListItem>
                            </List>
                            <Divider />
                            <List>
                                {connectionsDashboard}
                                <ListItem button key="Profile" onClick={() => selectNavBarButton("me", "/browse/me")}>
                                    <ListItemIcon><AccountCircleIcon/></ListItemIcon>
                                    <ListItemText className={classes.root} disableTypography primary="Profile"/>
                                </ListItem>
                                <ListItem button key="Help" onClick={() => selectNavBarButton("help", "/browse/help")}>
                                    <ListItemIcon><HelpIcon/></ListItemIcon>
                                    <ListItemText className={classes.root} disableTypography primary="Help"/>
                                </ListItem>
                                <ListItem button key="Log Out" onClick={logOut}>
                                    <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                                    <ListItemText className={classes.root} disableTypography primary="Log Out"/>
                                </ListItem>
                            </List>
                        </div>
                    </Drawer>
                    <Typography variant="h6" className={classes.title}>
                        {pageTitle}
                    </Typography>
                    <Typography className={classes.root}>MCG Youth & Arts</Typography>
                </Toolbar>
            </AppBar>
                <Switch>
                    <Route exact path="/browse/events">
                        <Events
                            hostName={props.hostname}
                            eventsService={props.eventsService}
                        />
                    </Route>
                    <Route exact path="/browse/events/add">
                        <AddEvent serverClient={props.serverClient}/>
                    </Route>
                    <Route exact path="/browse/events/:id">
                        <EventDetails eventsService={props.eventsService}/>
                    </Route>
                    <Route exact path="/browse/jobs/new">
                        <NewJobPosting serverClient={props.serverClient}/>
                    </Route>
                    <Route exact path="/browse/jobs/:id">
                        <CurrentJob jobsService={props.jobsService}/>
                    </Route>
                    <Route exact path="/browse/jobs">
                        <JobPostings jobsService={props.jobsService}/>
                    </Route>
                    <Route exact path="/browse/connections">
                        <Connections
                            hostname={props.hostname}
                            connectionsService={props.connectionsService}
                            accountsService={props.accountsService}
                            resourcesService={props.resourcesService}
                        />
                    </Route>
                    <Route exact path="/browse/account/:id">
                        <CurrentAccount accountsService={props.accountsService} resourcesService={props.resourcesService} hostname={props.hostname} connectionsService={props.connectionsService}/>
                    </Route>
                    <Route exact path="/browse/me">
                        <MyAccount accountsService={props.accountsService} resourcesService={props.resourcesService}/>
                    </Route>
                    <Route exact path="/browse/me/changeInfo">
                        <ChangeInfo accountsService={props.accountsService} resourcesService={props.resourcesService}/>
                    </Route>
                    <Route exact path="/browse/admin">
                        <Dashboard approvalRequestsService={props.approvalRequestsService}/>
                    </Route>
                    <Route exact path="/browse/help">
                        <div style={{marginTop: '5%', fontFamily: Style.FontFamily, textAlign: 'center'}}>
                            <Typography variant='p'>
                                For Help:
                            </Typography>
                        </div>
                        <div style={{marginTop: '1%', textAlign: 'center'}}>
                            <Typography variant='body1' style={{fontFamily: Style.FontFamily}}>
                                Email <a href={`mailto:${getContactEmail()}`}>{getContactEmail()}</a> with bug reports or questions.
                            </Typography>
                        </div>
                    </Route>
                    <Route><Redirect to={{pathname: "/browse/connections"}}/></Route>
                </Switch>
            </div>
    );
}

export default ContentBrowser;
