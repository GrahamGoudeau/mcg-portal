import React, {useState, useEffect} from 'react';
import { Grid, Paper, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../../lib/Style'
import UseAsyncState from "../../lib/Async";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import BadgeGrid from "./BadgeGrid"; // todo handle connection messages

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
            alert("You've sent a request! An MCG admin will reach out soon.")
        }
    }

    return <Card elevation={5}>
        <CardContent>
            <Typography variant="h5" style={{fontFamily: Style.FontFamily}}>
                {props.data.firstName} {props.data.lastInitial}.
            </Typography>
            <hr/>
            <BadgeGrid enrollmentStatus={props.data.enrollmentStatus} badges={props.data.resources} allowEdits={false} resourcesService={props.resourcesService}/>
            <hr/>
            <Button variant="contained" className={props.classes.button} onClick={requestConnection}>Request a connection</Button>
        </CardContent>
    </Card>
}



function Connections(props) {
    const classes = useStyles();
    const [connectionsList, setConnectionsList] = UseAsyncState([]);

    useEffect(() => {
        const url = `${props.hostname}/api/accounts`;
        fetch(url,{method: 'GET',}).then(r => {
            return r.json();
        }).then(body => body.map(account => <Grid item xs={12} lg={6} style={{width: '100%'}}>
                <Account data={account} classes={classes} connectionsService={props.connectionsService} resourcesService={props.resourcesService}/>
            </Grid>
        ))
            .then(setConnectionsList)
            .catch(e => {
                console.log(e);
                throw e;
            })
    }, [props.connectionsService, props.hostname]);

    return ( connectionsList.length === 0 ? <Typography variant="h5" style={{textAlign: 'center'}}>No people to connect with yet!</Typography> :
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
