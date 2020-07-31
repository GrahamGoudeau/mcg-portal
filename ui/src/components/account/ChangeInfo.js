import React, {useEffect, useState} from "react";
import {
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
import ResourceSelector from "../connection/ResourceSelector";
import UseAsyncState from "../../lib/Async";
import AccountsSvc from "../../svc/AccountsSvc"
import Autocomplete from '@material-ui/lab/Autocomplete';


const useStyles = makeStyles((theme) => ({
    root: {
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
    textbox: {
        marginBottom: '1vh'
    },
    submitted: {
        fontSize: '12px',
        color: 'green',
        margin: 0,
        maxWidth: '90%',
        textAlign: 'center',
        display: 'inline-block',
        height: '12px',
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

function ChangeInfo(props){
    const classes = useStyles();
    const history = useHistory();
    var [info, setinfo] = useState({});
    const [newResourceName, setNewResourceName] = useState('');
    const [editAccountModalOpen, setEditAccountModalOpen] = useState(false);
    const [requestStatus, setRequestStatus] = useState(false);

    var items = [];

    function handleChanges()  {
        props.accountsService.updateAccountInfo(info.id, editBioInfo, editCurrentRoll, editCurrentSchool, editCurrentCompany, editFirstName, editLastName);
        setRequestStatus(true)
        items = <Typography> Your Profile has been updated! </Typography>
    }

    useEffect(() => {
      props.accountsService.getMyAccount().then(accountData => {
          setinfo(accountData);
      })
    });

    console.log(info)

    const [editBioInfo, setEditBioInfo] = useState(info.bio);
    const [editCurrentRoll, setEditCurrentRoll] = useState(info.currentRole);
    const [editCurrentSchool, setEditCurrentSchool] = useState(info.currentSchool);
    const [editCurrentCompany, setEditCurrentCompany] = useState(info.currentCompany);
    const [editFirstName, setEditFirstName] = useState(info.firstName);
    const [editLastName, setEditLastName] = useState(info.lastName);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    var requestStatusReport = [];

    if(requestStatus == true){
        requestStatusReport = <div className={classes.submitted}>You have successfully updated your profile!</div>
    }


    return (

        <Grid container direction="column" alignContent="center" alignItems="center" justify="flex-start">
        <Grid item xs={10} sm={9} md={6} lg={6} alignItems="center"  direction="column" style={{width: '100%', display: 'flex', fontFamily: Style.FontFamily}}>
              <br/>
              <br/>
              <Paper elevation={5} style={{width: '100%', marginBottom: '3%'}}>
                <DialogTitle>Edit Profile Information</DialogTitle>
                <DialogContent>
                    <Typography className={classes.subHeader}> First Name </Typography>
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={editFirstName} onChange={e => setEditFirstName(e.target.value)}/>

                    <Typography className={classes.subHeader}> Last Name </Typography>
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={editLastName} onChange={e => setEditLastName(e.target.value)}/>

                    <Typography className={classes.subHeader}> Bio </Typography>
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={editBioInfo} onChange={e => setEditBioInfo(e.target.value)}/>

                    <Typography className={classes.subHeader}> Current Roll </Typography>
                    <TextField fullWidth  variant="outlined" className={classes.textbox} value={editCurrentRoll} onChange={e => setEditCurrentRoll(e.target.value)}/>

                    <Typography className={classes.subHeader}> Current School </Typography>
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={editCurrentSchool} onChange={e => setEditCurrentSchool(e.target.value)}/>

                    <Typography className={classes.subHeader}> Current Company </Typography>
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={editCurrentCompany} onChange={e => setEditCurrentCompany(e.target.value)}/>

                    {requestStatusReport}

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => history.push('/browse/me')} color="primary">
                        Back
                    </Button>
                    <Button onClick={handleChanges} color="primary">
                        Update
                    </Button>
                </DialogActions>
                </Paper>
          </Grid>
        </Grid>
    );
}

export default ChangeInfo
