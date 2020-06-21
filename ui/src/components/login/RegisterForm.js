import React, {useState} from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import UseAsyncState from "../../lib/Async";
import Style from "../../lib/Style";
import { Grid } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(0),
            maxWidth: '100%',
            fontFamily: Style.FontFamily,
        },
    },
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        color: 'white',
        width: '90%',
        maxWidth: '100%',
        '&:hover': {
            backgroundColor: Style.Orange,
        }
    },
    textInput: {
        width: '100%',
        '& > *': {
            background: 'white',
        },
    },
    errorMessage: {
        fontSize: '12px',
        color: 'red',
        margin: 0,
        maxWidth: '90%',
        textAlign: 'center',
        display: 'inline-block',
        height: '3vh',
    },
    loading: {
        fontSize: '12px',
        color: 'black',
        margin: 0,
        maxWidth: '90%',
        textAlign: 'center',
        display: 'inline-block',
        height: '3vh',
    }
}));

function RegisterForm(props) {
    const classes = useStyles();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [enrollmentStatus, setEnrollmentStatus] = useState('Current Student');

    return (
        <form className={classes.root} noValidate autoComplete="off" style={{textAlign: "center"}} onSubmit={e => console.log(e)}>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="First Name" variant="outlined" value={email} onChange={e => setEmail(e.target.value)}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="Last Name" variant="outlined" value={password} onChange={e => setPassword(e.target.value)}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField className={classes.textInput} label="Email" variant="outlined" value={email} onChange={e => setEmail(e.target.value)}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="Password" type="password" variant="outlined" value={email} onChange={e => setEmail(e.target.value)}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="Confirm Password" type="password"  variant="outlined" value={password} onChange={e => setPassword(e.target.value)}/>
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="outlined" style={{width: '100%'}}>
                        <InputLabel id="enrollment-status-label">MCG Enrollment Status</InputLabel>
                        <Select
                            labelId="enrollment-status-label"
                            value={enrollmentStatus}
                            onChange={e => setEnrollmentStatus(e.target.value)}
                            label="MCG Enrollment Status"
                        >
                            <MenuItem value='Current Student'>Current Student</MenuItem>
                            <MenuItem value='Alum'>Alum</MenuItem>
                            <MenuItem value={'N/A'}>N/A</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Button variant="contained" className={classes.button} type="submit">Sign me up</Button>
        </form>
    )
}

export default RegisterForm
