import React, {useState} from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import UseAsyncState from "../../lib/Async";
import Style from "../../lib/Style";
import { Grid } from '@material-ui/core';
import { EnrollmentTypeSelector, notApplicableOption } from "../account/EnrollmentTypeSelector";

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
            backgroundColor: Style.Tan,
        }
    },
    textInput: {
        width: '100%',
        '& > *': {
            background: 'white',
        },
    },
    select: {
        background: 'white',
    },
    errorMessage: {
        fontSize: '12px',
        color: 'red',
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
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [enrollmentType, setEnrollmentType] = useState('');
    const [requestStatus, setRequestStatus] = UseAsyncState({
        loading: false,
        error: '',
    });
    const [validationError, setValidationError] = UseAsyncState('');

    async function submitForm(e) {
        e.preventDefault();

        await setRequestStatus({
            loading: false,
            error: '',
        });

        var validationError = '';
        if (email === '' || password === '' || firstName === '' || lastName === '' || confirmedPassword === '') {
            validationError = 'All fields are required';
        } else if (password !== confirmedPassword) {
            validationError = 'Passwords do not match';
        }

        const enrollmentTypeToSend = enrollmentType === notApplicableOption ? null : enrollmentType;

        await setValidationError(validationError);

        if (validationError !== '') {
            return;
        }

        await setRequestStatus({
            ...requestStatus,
            loading: true,
        });
        try {
            const message = await props.authService.createAccount(firstName, lastName, email, password, enrollmentTypeToSend);
            if (message !== '') {
                await setRequestStatus({
                    loading: false,
                    error: message,
                });
                return
            }
            await setRequestStatus({
                loading: false,
                error: message,
            });
            props.onSuccessfulRegister()
        } catch (e) {
            await setRequestStatus({
                loading: false,
                error: e.message,
            })
        }
    }

    let requestStatusReport = null;
    if (requestStatus.error !== '') {
        requestStatusReport = <div className={classes.errorMessage}>{requestStatus.error}</div>
    } else if (validationError !== '') {
        requestStatusReport = <div className={classes.errorMessage}>{validationError}</div>
    } else if (requestStatus.loading) {
        requestStatusReport = <div className={classes.loading}>Creating account...</div>
    }

    async function resetValidationAndUpdate(event, value, callback) {
        event.preventDefault();
        await setValidationError('');
        callback(value);
    }

    return (
        <form className={classes.root} noValidate autoComplete="off" style={{textAlign: "center"}}
              onSubmit={e => submitForm(e)}>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="First Name" variant="outlined"
                               value={firstName} onChange={e => resetValidationAndUpdate(e, e.target.value,
                            value => setFirstName(value))}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="Last Name" variant="outlined"
                               value={lastName} onChange={e => resetValidationAndUpdate(e, e.target.value,
                            value => setLastName(value))}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField className={classes.textInput} label="Email" variant="outlined" value={email}
                               onChange={e => resetValidationAndUpdate(e, e.target.value,
                                       value => setEmail(value))}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="Password" type="password" variant="outlined"
                               value={password} onChange={e => resetValidationAndUpdate(e, e.target.value,
                            value => setPassword(value))}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField className={classes.textInput} label="Confirm Password" type="password"
                               variant="outlined" value={confirmedPassword} onChange={e => resetValidationAndUpdate(e,
                        e.target.value, value => setConfirmedPassword(value))}/>
                </Grid>
                <Grid item xs={12}>
                    <EnrollmentTypeSelector
                        onChange={setEnrollmentType}
                        className={classes.select}
                        formControlVariant='outlined'
                        allowNotApplicableOption
                    />
                </Grid>
            </Grid>
            <Button variant="contained" className={classes.button} type="submit" disabled={validationError !== ''}>
                Sign me up</Button>
            {requestStatusReport}
        </form>
    )
}

export default RegisterForm
