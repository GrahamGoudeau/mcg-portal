import React, {useEffect, useState} from 'react';
import { Grid, Button } from '@material-ui/core';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Style from '../../lib/Style'
import UseAsyncState from "../../lib/Async";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import BadgeGrid from "./BadgeGrid"; // todo handle connection messages
import ResourceSelector from "./ResourceSelector";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { EnrollmentTypeSelector, allOption } from "../account/EnrollmentTypeSelector";

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
            <BadgeGrid enrollmentType={props.data.enrollmentType} badges={props.data.resources} allowEdits={false} resourcesService={props.resourcesService}/>
            <hr/>
            <Button variant="contained" className={props.classes.button} onClick={requestConnection}>Request a connection</Button>
        </CardContent>
    </Card>
}



function Connections(props) {
    const classes = useStyles();
    const [accountsList, setAccountsList] = UseAsyncState([]);
    const [resourcesFilter, setResourcesFilter] = useState(null);
    const [enrollmentFilter, setEnrollmentFilter] = useState(null);

    useEffect(() => {
        const url = `${props.hostname}/api/accounts`;
        fetch(url,{method: 'GET',})
            .then(r => {
                return r.json();
            }).then(setAccountsList)
            .catch(e => {
                console.log(e);
                throw e;
            });
    }, [props.connectionsService, props.hostname]);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const connectionsList = accountsList
        .filter(account => {
            const returnAllAccounts = resourcesFilter == null || resourcesFilter === ResourceSelector.AllOption;
            const thisAccountMatches = resourcesFilter != null &&
                account.resources &&
                account.resources.map(r => r.name).includes(resourcesFilter);
            return thisAccountMatches || returnAllAccounts;
        })
        .filter(account => {
            const returnAllAccounts = enrollmentFilter == null || enrollmentFilter === allOption;
            const thisAccountMatches = enrollmentFilter != null && enrollmentFilter === account.enrollmentType;
            return thisAccountMatches || returnAllAccounts;
        })
        .map(account => <Grid item xs={12} lg={6} style={{width: '100%'}}>
            <Account data={account} classes={classes} connectionsService={props.connectionsService} resourcesService={props.resourcesService}/>
        </Grid>
    );

    return ( accountsList.length === 0 ? <Typography variant="h5" style={{textAlign: 'center'}}>No people to connect with yet!</Typography> :
        <div style={{flexGrow: 1, paddingLeft: '10%', paddingRight: '10%', paddingTop: '3%'}}>
            <Grid
                container
                direction="column"
                spacing={3}
                alignItems="center"
            >
                <Grid item xs={12} lg={6} style={{width: '100%', textAlign: "right"}}>
                    <Grid
                        container
                        direction={isSmallScreen ? 'column' : 'row'}
                        spacing={1}
                        justify="flex-end"
                    >
                        <Grid item xs={3} style={{maxWidth: '100%', width: "100%", overflow: "visible"}}>
                            <ResourceSelector.Component allowAllOption onChange={setResourcesFilter}/>
                        </Grid>
                        <Grid item xs={3} style={{maxWidth: '100%', width: "100%", overflow: "visible"}}>
                            <EnrollmentTypeSelector allowAllOption allowStaffOption onChange={setEnrollmentFilter}/>
                        </Grid>
                    </Grid>
                </Grid>
                {connectionsList.length > 0 ? connectionsList : <Typography variant="h5" style={{fontFamily: Style.FontFamily}}>No one matches your filters!</Typography>}
            </Grid>
        </div>
    )
}

export default Connections;
