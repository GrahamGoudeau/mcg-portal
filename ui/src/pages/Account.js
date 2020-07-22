import React, {useEffect, useState} from "react";
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Style from '../lib/Style'
import {Button, Grid, TextField} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Name from "../lib/Name";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Tooltip from '@material-ui/core/Tooltip';
import BadgeGrid from '../components/connection/BadgeGrid';
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
      marginTop: '0vh',
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

function Account(props){
    const classes = useStyles();
    const [info, setinfo] = useState({});
    const [userResourceNames, setUserResourceNames] = useState([]);
    const [badgeUpdateVersion, setBadgeUpdateVersion] = useState(0);
    const [newResourceModalOpen, setNewResourceModalOpen] = useState(false);
    const [newResourceName, setNewResourceName] = useState('');

    const handleOpen = () => {
        setNewResourceModalOpen(true);
    };

    const handleClose = () => {
        setNewResourceModalOpen(false);
        setNewResourceName('');
    };

    function submitNewResource(e) {
        e.preventDefault();
        if (newResourceName !== '') {
            props.resourcesService.createResource(info.id, newResourceName);
            handleClose();
            setBadgeUpdateVersion(badgeUpdateVersion + 1);
        }
    }

    useEffect(() => {
      props.accountsService.getMyAccount().then(accountData => {
          setinfo(accountData);
          props.resourcesService.getResourcesForUser(accountData.id)
              .then(resources => resources.map(r => ({name: r.name, id: r.id})))
              .then(setUserResourceNames);
      })
    }, [props.accountsService, props.resourcesService, badgeUpdateVersion]);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <React.Fragment>
            <Dialog open={newResourceModalOpen} onClose={handleClose}>
                <DialogTitle>Create a new resource</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{marginBottom: '3%'}}>
                        Offer a new resource to the MCG community. This can be mentoring, networking, resume critiques, etc.
                        Those who are interested in the resource you're offering will be connected to you via MCG staff.
                    </DialogContentText>
                    <TextField fullWidth label="Description" variant="outlined" value={newResourceName} onChange={e => setNewResourceName(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={submitNewResource} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

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
                            <Typography variant="h5" className={classes.subHeader}>
                                Resources You're Offering
                            </Typography>
                            <Button variant="contained" className={classes.button} onClick={handleOpen}>Offer a new resource</Button>
                            <hr/>
                            <BadgeGrid
                                badges={userResourceNames}
                                allowEdits={true}
                                userId={info.id}
                                resourcesService={props.resourcesService}
                                onUpdate={() => setBadgeUpdateVersion(badgeUpdateVersion + 1)}
                            />
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default Account
