import { Grid } from '@material-ui/core';
import React from 'react';
import LoginForm from "../components/login/LoginForm";
import { useHistory } from "react-router-dom";
import Style from '../lib/Style'
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        color: 'white',
        width: '90%',
        maxWidth: '100%',
        '&:hover': {
            backgroundColor: Style.Tan,
        },
        marginTop: '5vh',
    },
}));

function Login(props) {
    const history = useHistory();
    const classes = useStyles();

    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{
                minHeight: '100vh',
                textAlign: 'center',
                fontFamily: 'Open Sans',
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: '36px',
                background: Style.White,
                color: Style.NavyBlue,
            }}
        >
            <Grid item sm={5} md={5} lg={3}>
                <p>MCG Youth & Arts Portal</p>
                <LoginForm
                    authService={props.authService}
                    onSuccessfulLogIn={() => {
                        history.replace("/browse")
                    }}
                />
                <Button variant="contained" className={classes.button} onClick={() => history.push("/register")}>
                    Create Account</Button>
            </Grid>
        </Grid>
    );
}

export default Login
