import React, {useState} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../lib/Style'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

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

    const [pageTitle, setPageTitle] = useState('Connections');
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <div>
            {/*{['left', 'right', 'top', 'bottom'].map((anchor) => (*/}
            {/*    <React.Fragment key={anchor}>*/}
            {/*        <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>*/}
            {/*        <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>*/}
            {/*            {list(anchor)}*/}
            {/*        </Drawer>*/}
            {/*    </React.Fragment>*/}
            {/*))}*/}
            <AppBar position="static">
                <Toolbar className={classes.bar}>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={handleClick}>
                        <MenuIcon/>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>My account</MenuItem>
                            <MenuItem onClick={handleClose}>Logout</MenuItem>
                        </Menu>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {pageTitle}
                    </Typography>
                    <Button color="inherit" className={classes.root}>Log Out</Button>
                </Toolbar>
            </AppBar>
            <Router>
                <Switch>
                    <Route>
                        <Redirect to={{pathname: "/browse/connections"}}/>
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default ContentBrowser;
