import React, {useEffect, useState} from "react";
import {
    useParams,
    useHistory,
} from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Style from '../lib/Style'
import {Button, Grid} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Name from "../lib/Name";
import BadgeGrid from '../components/connection/BadgeGrid';
import AccountInfoGrid from "../components/account/AccountInfoGrid";


const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
    },
    subHeader: {
        fontFamily: Style.FontFamily,
        fontWeight: 'bold',
    },
    button: {
      fontFamily: Style.FontFamily,
      backgroundColor: Style.Purple,
      color: 'white',
      minWidth: '25%',
      width: '100%',
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.NavyBlue,
      },
      textTransform: 'none',
      whiteSpace: 'nowrap',
        marginBottom: '2%',
    },
    requestConnectionButton: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        color: 'black',
        minWidth: '25%',
        width: '100%',
        maxWidth: '100%',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        '&:hover': {
            backgroundColor: Style.Tan,
        },
        textTransform: 'none',
        whiteSpace: 'nowrap',
        marginBottom: '2%',
    },
}));

function CurrentAccount(props){
    const classes = useStyles();
    const history = useHistory();
    const [info, setinfo] = useState({});
    const match = useParams();
    const [userResourceNames, setUserResourceNames] = useState([]);
    const {
        accountsService,
        resourcesService,
    } = props;

    useEffect( () => {
        accountsService
            .getAccountDetails(match.id)
            .then(account => ({
                ...account,
                name: Name({firstName: account.firstName, lastName: account.lastInitial}) + ".",
                email: "[Hidden... Request a connection!]",
            }))
            .then(setinfo);
        resourcesService.getResourcesForUser(parseInt(match.id, 10), true)
            .then(resources => resources.map(r => ({name: r.name, id: r.id})))
            .then(setUserResourceNames);
    }, [accountsService, resourcesService, match.id]);

    function requestConnection() {
        /*eslint no-restricted-globals: [0]*/
        if (confirm("Are you sure you'd like to request a connection? If so, an MCG admin will facilitate an email introduction")) {
            props.connectionsService.initiateConnectionRequest(match.id);
            alert("You've sent a request! An MCG admin will reach out soon.")
        }
    }

    const theme = useTheme();
    const isXSmallScreen = useMediaQuery(theme.breakpoints.down('xs'))

    return (
        <React.Fragment>
            <Typography variant="h4" style={{fontFamily: Style.FontFamily, textAlign: 'center', margin: '3%'}}>User Profile</Typography>
            <Grid
                container
                direction="column"
                alignContent="center"
                alignItems="center"
                justify="flex-start"
            >
                <Grid item xs={10} sm={9} md={6} lg={6}
                      alignItems="center"
                      direction="column"
                      style={{width: '100%', display: 'flex', fontFamily: Style.FontFamily}}
                >
                    {info === {} ? null : <AccountInfoGrid account={info}/>}

                    <Paper elevation={5} style={{width: '100%'}}>
                        <div style={{padding: '2%'}}>
                            <Typography variant="h5" className={classes.subHeader}>
                                Resources Offered by User
                            </Typography>
                            <hr style={{display: userResourceNames.length > 0 ? 'block' : 'none'}}/>
                            <BadgeGrid
                                badges={userResourceNames}
                                allowEdits={false}
                                userId={info.id}
                                resourcesService={props.resourcesService}
                            />
                        </div>
                    </Paper>
                    <br/>
                    <Grid
                        container
                        direction={isXSmallScreen ? 'column' : 'row'}
                    >
                        <Grid item xs={12} sm={6} md={6} lg={6} style={{marginBottom: '5%', paddingRight: '2%',  paddingLeft: '2%'}}>
                            <Button className={classes.button} onClick={() => history.push('/browse/connections')}> Back to Connections </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={6} style={{marginBottom: '5%', paddingRight: '2%', paddingLeft: '2%'}}>
                            <Button variant="contained" className={classes.requestConnectionButton} onClick={requestConnection}>Request a connection</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default CurrentAccount
