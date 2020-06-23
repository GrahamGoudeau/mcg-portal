import React, {useState} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useHistory,
    useRouteMatch,
} from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
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
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import EventIcon from '@material-ui/icons/Event';
import BusinessIcon from '@material-ui/icons/Business';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        fontFamily: Style.FontFamily,
    },
    bar: {
        background: Style.Blue,
    }
}));

function ContentBrowser(props) {
    const classes = useStyles();
    const history = useHistory();

    const pageTitles = {
        'connections': 'Connections',
        'jobs': 'Jobs',
        'events': 'Events',
    };

    const [pageTitle, setPageTitle] = useState(pageTitles['connections']);

    const match = useRouteMatch({
        path: '/browse/:slug/',
    });
    console.log(match, match.params.slug);

    const computedPageTitle = pageTitles[match.params.slug];
    console.log("Computed", computedPageTitle)
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
        setPageTitle(title);
    }

    return (
        <div>
            <AppBar position="static">
                <Toolbar className={classes.bar}>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={() => setNavDrawerOpen(!navDrawerOpen)}>
                        <MenuIcon/>
                    </IconButton>
                    <Drawer anchor="left" open={navDrawerOpen} onClose={() => setNavDrawerOpen(false)}>
                        <div role="presentation">
                            <List>
                                <ListItem button key="Connections" onClick={() => selectNavBarButton("Connections", "/browse/connections")}>
                                    <ListItemIcon><EmojiPeopleIcon/></ListItemIcon>
                                    <ListItemText primary="Connections"/>
                                </ListItem>
                                <ListItem button key="Events" onClick={() => selectNavBarButton("Events", "/browse/events")}>
                                    <ListItemIcon><EventIcon/></ListItemIcon>
                                    <ListItemText primary="Events"/>
                                </ListItem>
                                <ListItem button key="Jobs" onClick={() => selectNavBarButton("Jobs", "/browse/jobs")}>
                                    <ListItemIcon><BusinessIcon/></ListItemIcon>
                                    <ListItemText primary="Jobs"/>
                                </ListItem>
                            </List>
                            <Divider />
                            <List>
                                <ListItem button key="Account" onClick={() => selectNavBarButton("My Account", "/browse/me")}>
                                    <ListItemIcon><AccountCircleIcon/></ListItemIcon>
                                    <ListItemText primary="Account"/>
                                </ListItem>
                                <ListItem button key="Log Out" onClick={logOut}>
                                    <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                                    <ListItemText primary="Log Out"/>
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
                        <h1>Events</h1>
                    </Route>
                    <Route exact path="/browse/jobs">
                        <h1>Jobs</h1>
                    </Route>
                    <Route exact path="/browse/connections">
                        <h1>Connections</h1>
                    </Route>
                    <Route exact path="/browse/me">
                        <h1>Account</h1>
                    </Route>
                    <Route><Redirect to={{pathname: "/browse/connections"}}/></Route>
                </Switch>
        </div>
    );
}

export default ContentBrowser;
