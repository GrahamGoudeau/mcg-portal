import React, {useEffect, useState} from "react";
import {
    useHistory,
} from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Style from '../lib/Style'
import {Button, Grid, TextField} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles(() => ({
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
    var [info, setinfo] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        currentRole: '',
        currentCompany: '',
        currentSchool: '',
    });
    const [requestStatus, setRequestStatus] = useState(false);

    function handleChanges()  {
        props.accountsService.updateAccountInfo(info.bio, info.currentRole, info.currentSchool, info.currentCompany, info.firstName, info.lastName);
        setRequestStatus(true)
    }

    useEffect(() => {
      props.accountsService.getMyAccount().then(accountData => {
          setinfo(accountData);
      })
    }, [props.accountsService]);

    return (

        <Grid container direction="column" alignContent="center" alignItems="center" justify="flex-start">
        <Grid item xs={10} sm={9} md={6} lg={6} alignItems="center"  direction="column" style={{width: '100%', display: 'flex', fontFamily: Style.FontFamily}}>
              <br/>
              <br/>
              <Paper elevation={5} style={{width: '100%', marginBottom: '3%'}}>
                <DialogTitle>Edit Profile Information</DialogTitle>
                <DialogContent>
                    <Grid container direction='column' justify='left'>
                        <Grid item xs={12}>
                            <TextField label='First Name' autoComplete='off' fullWidth variant="outlined" className={classes.textbox} value={info.firstName} onChange={e => setinfo({
                                ...info,
                                firstName: e.target.value,
                            })}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField autoComplete='off' label='Last Name' fullWidth variant="outlined" className={classes.textbox} value={info.lastName} onChange={e => setinfo({
                                ...info,
                                lastName: e.target.value,
                            })}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField autoComplete='off' label='Bio' multiline rows={5} fullWidth variant="outlined" className={classes.textbox} value={info.bio} onChange={e => setinfo({
                                ...info,
                                bio: e.target.value,
                            })}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fautoComplete='off' label='Current Role' fullWidth variant="outlined" className={classes.textbox} value={info.currentRole} onChange={e => setinfo({
                                ...info,
                                currentRole: e.target.value,
                            })}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField autoComplete='off' label='Current Company' fullWidth variant="outlined" className={classes.textbox} value={info.currentCompany} onChange={e => setinfo({
                                ...info,
                                currentCompany: e.target.value,
                            })}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField autoComplete='off' label='School' fullWidth variant="outlined" className={classes.textbox} value={info.currentSchool} onChange={e => setinfo({
                                ...info,
                                currentSchool: e.target.value,
                            })}/>
                        </Grid>
                        <Grid item xs={12} style={{color: 'green', textAlign: 'left'}}>
                            {requestStatus ? 'You have successfully submitted your account update for review! Your changes will not be visible until an admin reviews and approves.' : null}
                        </Grid>
                    </Grid>
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
