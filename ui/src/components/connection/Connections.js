import React, {useState, useEffect} from 'react';
import { Grid, Paper, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../../lib/Style'
import UseAsyncState from "../../lib/Async";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal'; // todo handle connection messages

const useStyles = makeStyles(theme => ({
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        fontSize: '16px',
        color: 'white',
        width: '100%',
        '&:hover': {
            backgroundColor: Style.NavyBlue,
        },
        padding: theme.spacing(2),
    },
    paper: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        fontSize: '16px',
        padding: '1%',
        textAlign: 'center',
        textTransform: 'none',
        borderRadius: '5px',
        width: '95%',
    },
    container: {
        paddingBottom: '15vh',
        marginLeft: '12px',
        marginRight: '12px',
        marginBottom: '62px',
        maxWidth: '100%',
    },
    account: {

    }
}));

function Account(props) {
    function requestConnection() {
        /*eslint no-restricted-globals: [0]*/
        if (confirm("Are you sure you'd like to request a connection? If so, an MCG admin will facilitate an email introduction")) {
            props.connectionsService.initiateConnectionRequest(props.data.id);
        }
    }

    const badges = [];
    if (props.data.enrollmentStatus != null) {
        badges.push(props.data.enrollmentStatus);
    }

    const badgeGridItems = [...badges, ...props.data.resources].map((badgeText, i) => {
        console.log("Badge text", badgeText);
        return <Grid key={badgeText + i} item xs={6} sm={2} md={2} lg={2} style={{paddingTop: '0%', minWidth: '20%'}}>
            <Badge classes={props.classes} name={badgeText}/>
        </Grid>
    });

    return <Card elevation={5}>
        <CardContent>
            <Typography variant="h5" style={{marginBottom: '3%'}}>
                {props.data.firstName} {props.data.lastInitial}.
            </Typography>
            <hr/>
            <Grid container spacing={3} style={{marginTop: '1%'}}>
                {badgeGridItems}
            </Grid>
            <hr/>
            <Button variant="contained" className={props.classes.button} onClick={requestConnection}>Request a connection</Button>
        </CardContent>
    </Card>
}

function Badge(props) {
    return <Paper className={props.classes.paper}  style={{margin: '1%'}}>{props.name}</Paper>
}

function Connections(props) {
    const classes = useStyles();
    const [connectionsList, setConnectionsList] = UseAsyncState([]);

    useEffect(() => {
        console.log("Effecting in connections");
        const url = `${props.hostname}/api/accounts`;
        fetch(url,{method: 'GET',}).then(r => {
            return r.json();
        }).then(body => body.map(account => <Grid item xs={12} lg={6} style={{width: '100%'}}>
                <Account data={account} classes={classes} connectionsService={props.connectionsService}/>
            </Grid>
        ))
            .then(setConnectionsList)
            .catch(e => {
                console.log(e);
                throw e;
            })
    }, [props.connectionsService, props.hostname]);

    return (
        <div style={{flexGrow: 1, paddingLeft: '10%', paddingRight: '10%', paddingTop: '5%'}}>
            <Grid
                container
                direction="column"
                spacing={3}
                alignItems="center"
            >
                {connectionsList}
            </Grid>
        </div>
    )
}

export default Connections;
