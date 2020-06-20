import React from 'react';
import { TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SetStateAsync from "../../lib/Async";

const useStyles = (theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '100%',
        },
    },
    button: {
        backgroundColor: '#7261EE',
        color: 'white',
        width: '100%',
        '&:hover': {
            backgroundColor: '#7261EE',
        }
    },
    errorMessage: {
        fontSize: '12px',
        color: 'red',
        // display: 'inline-block',
        margin: 0,
    },
    loading: {
        fontSize: '12px',
        color: 'black',
    }
});

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            lastLogInAttemptFailed: false,
            logInError: null,
            loading: false,
        }
    }

    async submitLogIn(event) {
        event.preventDefault();
        await SetStateAsync(this, {loading: true});
        console.log(this.state)

        try {
            const logInSuccessful = await this.props.authService.logIn(this.state.email, this.state.password)
            if (logInSuccessful) {
                this.setState({
                    lastLogInAttemptFailed: false,
                    logInError: null,
                    loading: false,
                })
            } else {
                this.setState({
                    lastLogInAttemptFailed: true,
                    logInError: null,
                    loading: false,
                })
            }
        } catch (e) {
            this.setState({
                lastLogInAttemptFailed: false,
                logInError: e,
                loading: false,
            })
        }
    }

    render() {
        const { classes } = this.props;

        var logInReport = null;
        if (this.state.loading) {
            logInReport = <div className={classes.loading}>Logging in...</div>
        } else if (this.state.lastLogInAttemptFailed) {
            logInReport = <div className={classes.errorMessage}>Incorrect email or password</div>
        } else if (this.state.logInError != null) {
            logInReport = <div className={classes.errorMessage}>Unexpected error. Please have a </div>
        }

        return (
            <form className={classes.root} noValidate autoComplete="off" style={{textAlign: "center"}} onSubmit={e => this.submitLogIn(e)}>
                <TextField id="outlined-basic" label="Email" variant="outlined" value={this.state.email} onChange={e => this.setState({email: e.target.value})}/>
                <TextField id="outlined-basic" label="Password" type="password" variant="outlined" value={this.state.password} onChange={e => this.setState({password: e.target.value})}/>
                {logInReport}
                <Button variant="contained" className={classes.button} type="submit">Log In</Button>
            </form>
        )
    }
}

export default withStyles(useStyles)(LoginForm)
