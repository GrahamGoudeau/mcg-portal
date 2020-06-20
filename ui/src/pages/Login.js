import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { Grid } from '@material-ui/core';
import React from 'react';
import LoginForm from "../components/login/LoginForm";

function Login(props) {
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh', textAlign: 'center', fontFamily: 'Open Sans',
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: '36px',
                lineHeight: '49px',
            }}
        >
            <Grid item xs={3}>
                <p>MCG Youth & Arts Portal</p>
                <LoginForm authService={props.authService} />
            </Grid>
        </Grid>
    );
}

export default Login
