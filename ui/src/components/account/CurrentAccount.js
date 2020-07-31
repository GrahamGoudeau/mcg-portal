import React, {useEffect, useState} from "react";
import {
    useParams,
    useHistory,
} from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Style from '../../lib/Style'
import {Button, Grid, TextField} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Name from "../../lib/Name";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Tooltip from '@material-ui/core/Tooltip';
import BadgeGrid from '../connection/BadgeGrid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


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
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.NavyBlue,
      },
      textTransform: 'none',
      whiteSpace: 'nowrap',
        marginBottom: '2%',
    },
    title: {
        flexGrow: 1,
        fontFamily: Style.FontFamily,
    },
    bar: {
        background: Style.Blue,
    },
    card: {
        border: '1px solid #CFCFCF',
        boxSizing: 'border-box',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    },
    modal: {
        position: 'absolute',
        width: '50%',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        top: '25%',
        left: '0%',
    },
    modalForm: {
        '& > *': {
            margin: theme.spacing(1),
            width: '90%',
            maxWidth: '100%',
            fontFamily: Style.FontFamily,
        },
    },
}));

function CurrentAccount(props){
    const classes = useStyles();
    const history = useHistory();
    const [info, setinfo] = useState({});
    const match = useParams();
    const [userResourceNames, setUserResourceNames] = useState([]);

    useEffect( () => {
        props.accountsService.getAccountDetails(match.id).then(setinfo);
        props.resourcesService.getResourcesForUser(match.id)
            .then(resources => resources.map(r => ({name: r.name, id: r.id})))
            .then(setUserResourceNames);
    }, [props.accountsService, props.resourcesService, match.id]);

    console.log(info);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

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
                    <Paper elevation={5} style={{width: '100%', marginBottom: '3%'}}>
                        <div style={{padding: '2%'}}>
                            <Typography variant="h5" className={classes.subHeader}>
                                General
                            </Typography>
                            <hr/>
                            <Grid
                                container
                                direction={isSmallScreen ? 'column' : 'row'}
                            >
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Name:</Typography>
                                    {Name(info)}
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h6" className={classes.subHeader}>Enrollment:</Typography>
                                    <span style={{lineHeight: '10%'}}>
                                        {info.enrollmentType ? info.enrollmentType : 'Not enrolled'}
                                    </span>
                                </Grid>
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Bio:</Typography>
                                    {info.bio}
                                </Grid>
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Current Roll:</Typography>
                                    {info.currentRole}
                                </Grid>
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Current School:</Typography>
                                    {info.currentSchool}
                                </Grid>
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Current Company:</Typography>
                                    {info.currentCompany}
                                </Grid>
                                <Grid item xs={6} >

                                </Grid>
                            </Grid>
                        </div>
                    </Paper>

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
                    <Button className={classes.button} onClick={() => history.push('/browse/connections')}> Back to Connections </Button>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default CurrentAccount
