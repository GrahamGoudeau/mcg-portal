import React, {useEffect, useState} from "react";
import {
    useHistory,
} from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Style from '../lib/Style'
import {Button, Grid, TextField} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
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
}));

function ChangeInfo(props){
    const classes = useStyles();
    const history = useHistory();
    var [info, setinfo] = useState({});
    const [requestStatus, setRequestStatus] = useState(false);

    function handleChanges()  {
        props.accountsService.updateAccountInfo(info.id, info.bio, info.currentRole, info.currentSchool, info.currentCompany, info.firstName);
        setRequestStatus(true)
    }

    useEffect(() => {
      props.accountsService.getMyAccount().then(accountData => {
          setinfo(accountData);
      })
    }, []);

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
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={info.firstName} onChange={e => setinfo({
                          ...info,
                          firstName: e.target.value,
                    })}/>

                    <Typography className={classes.subHeader}> Bio </Typography>
                    <TextField multiline fullWidth variant="outlined" className={classes.textbox} value={info.bio} onChange={e => setinfo({
                          ...info,
                          bio: e.target.value,
                    })}/>

                    <Typography className={classes.subHeader}> Current Roll </Typography>
                    <TextField fullWidth  variant="outlined" className={classes.textbox} value={info.currentRole} onChange={e => setinfo({
                          ...info,
                          currentRole: e.target.value,
                    })}/>

                    <Typography className={classes.subHeader}> Current School </Typography>
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={info.currentSchool} onChange={e => setinfo({
                          ...info,
                          currentSchool: e.target.value,
                    })}/>

                    <Typography className={classes.subHeader}> Current Company </Typography>
                    <TextField fullWidth variant="outlined" className={classes.textbox} value={info.currentCompany} onChange={e => setinfo({
                          ...info,
                          currentCompany: e.target.value,
                    })}/>

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
