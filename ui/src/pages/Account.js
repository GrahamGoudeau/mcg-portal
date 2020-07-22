import React, {useEffect, useState} from "react";
import {
  useHistory,
} from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Style from '../lib/Style'
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Name from "../lib/Name";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Tooltip from '@material-ui/core/Tooltip';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
    },
    subHeader: {
        fontFamily: Style.FontFamily,
    },
    boldText: {
        fontSize: "18px",
        fontWeight: "bold",
        lineHeight: "25px",
        marginBottom: '1vh',
        fontFamily: Style.FontFamily,
    },
    nonBoldText: {
        fontSize: "16px",
        fontWeight: "normal",
        lineHeight: "22px",
        marginBottom: '2vh',
        fontFamily: Style.FontFamily,
    },
    Button: {
      fontFamily: Style.FontFamily,
      backgroundColor: Style.Purple,
      color: 'white',
      width: '100%',
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.Blue,
      },
      marginTop: '0vh',
      paddingTop: '2vh',
      paddingBottom: '2vh',
      textTransform: 'none',
      whiteSpace: 'nowrap',
    },
    rectangle: {
      backgroundColor: '#F7991B',
      width: '50%',
      borderRadius: '5px',
      fontSize: "16px",
      fontWeight: "normal",
      lineHeight: "32px",
      marginBottom: '2vh',
      whiteSpace: 'nowrap',
      fontFamily: Style.FontFamily,
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
}));

function Account(props){
    const classes = useStyles();
    const [info, setinfo] = useState({});
    const [userResources, setUserResources] = useState(null);

    useEffect(() => {
      props.accountsService.getMyAccount().then(accountData => {
          setinfo(accountData);
          props.resourcesService.getResourcesForUser(accountData.id).then(setUserResources);
      })
    }, [props.accountsService, props.resourcesService]);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <React.Fragment>
            <Typography variant="h4" style={{fontFamily: Style.FontFamily, textAlign: 'center', margin: '3%'}}>Your Profile</Typography>
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
                                <Tooltip title='Contact an MCG admin to change these values'>
                                    <HelpOutlineIcon fontSize='small'/>
                                </Tooltip>
                            </Typography>
                            <hr/>
                            <Grid
                                container
                                direction={isSmallScreen ? 'column' : 'row'}
                            >
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Email:</Typography>
                                    {info.email}
                                </Grid>
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Name:</Typography>
                                    {Name(info)}
                                </Grid>
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6" className={classes.subHeader}>Enrollment:</Typography>
                                    <span style={{lineHeight: '10%'}}>
                                        {info.enrollmentStatus ? info.enrollmentStatus : 'Not enrolled'}
                                    </span>
                                </Grid>
                                <Grid item xs={6} >

                                </Grid>
                            </Grid>
                        </div>
                    </Paper>

                    <Paper elevation={5} style={{width: '100%'}}>
                        <div style={{padding: '2%'}}>
                            <Typography variant="h5">
                                Resources You're Offering
                            </Typography>
                            <hr/>
                            <Grid
                                container
                                alignContent="center"
                                direction={isSmallScreen ? 'column' : 'row'}
                                style={isSmallScreen ? {'textAlign': 'center'} : {}}
                            >
                                {userResources == null ? null : userResources.map(resource => {
                                    return <Grid item xs={6}>
                                        <span>{resource.id}</span>
                                    </Grid>
                                })}
                                <Grid item xs={6} style={isSmallScreen ? {'marginBottom': '5%'} : {}}>
                                    <Typography variant="h6">Email:</Typography>
                                    {info.email}
                                </Grid>
                                <Grid item xs={6} style={{marginBottom: '5%'}}>
                                    <Typography variant="h6">Name:</Typography>
                                    {Name(info)}
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h6">Enrollment:</Typography>
                                    <span style={{lineHeight: '10%'}}>
                                        {info.enrollmentStatus ? info.enrollmentStatus : 'Not enrolled'}
                                        <Tooltip title='Contact an MCG admin to change your enrollment status'>
                                            <HelpOutlineIcon fontSize='small'/>
                                        </Tooltip>
                                    </span>
                                </Grid>
                            </Grid>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    );


}

export default Account
