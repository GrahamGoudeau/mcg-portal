import React, {useState} from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import UseAsyncState from "../../lib/Async";
import Style from "../../lib/Style";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '90%',
            maxWidth: '100%',
            fontFamily: Style.FontFamily,
        },
    },
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        color: 'white',
        width: '90%',
        maxWidth: '100%',
        '&:hover': {
            backgroundColor: Style.NavyBlue,
        }
    },
    textInput: {
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

function LoginForm(props) {
    const classes = useStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [logInState, setLogInState] = UseAsyncState({
        lastAttemptFailed: false,
        error: null,
        loading: false,
    });

    async function submitLogIn(event) {
        event.preventDefault();
        await setLogInState({
            ...logInState,
            loading: true,
        });

        try {
            const logInSuccessful = await props.authService.logIn(email, password);
            if (logInSuccessful.jwt) {
                await setLogInState({
                    lastAttemptFailed: false,
                    error: null,
                    loading: false,
                });
                console.log(logInSuccessful);
                if (!logInSuccessful.hasLoggedInBefore) {
                    console.log("Is first login")
                    props.onFirstLogin();
                }
                props.onSuccessfulLogIn();
            } else {
                await setLogInState({
                    lastAttemptFailed: true,
                    error: null,
                    loading: false,
                });
            }
        } catch (e) {
            await setLogInState({
                lastAttemptFailed: false,
                error: e,
                loading: false,
            });
        }
    }

    let logInReport = null;
    if (logInState.loading) {
        logInReport = <div className={classes.loading}>Logging in...</div>
    } else if (logInState.lastAttemptFailed) {
        logInReport = <div className={classes.errorMessage}>Incorrect email or password</div>
    } else if (logInState.error != null) {
        logInReport = <div className={classes.errorMessage}>Unexpected error. Please have a web admin look at the logs!</div>
    } else {
        logInReport = <div className={classes.errorMessage}></div>
    }

    return (
        <form className={classes.root} noValidate autoComplete="off" style={{textAlign: "center"}} onSubmit={e => submitLogIn(e)}>
            <TextField className={classes.textInput} id="email-field" label="Email" variant="outlined" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
            <TextField className={classes.textInput} id="password-field" label="Password" type="password" variant="outlined" value={password} onChange={e => setPassword(e.target.value)}/>
            <Button variant="contained" className={classes.button} type="submit">Log In</Button>
            {logInReport}
        </form>
    )
}

export default LoginForm
