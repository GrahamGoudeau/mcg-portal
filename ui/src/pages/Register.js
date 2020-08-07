import { Grid } from '@material-ui/core';
import React from 'react';
import { useHistory } from "react-router-dom";
import Style from '../lib/Style'
import RegisterForm from "../components/login/RegisterForm";

function Register(props) {
    const history = useHistory();

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
                color: Style.NavyBlue,
            }}
        >
            <Grid item sm={9} md={5} lg={5}>
                <p>Let's Create A New Account</p>
                <RegisterForm
                    authService={props.authService}
                    onSuccessfulRegister={() => {
                        history.push("/browse")
                    }}
                />
            </Grid>
        </Grid>
    );
}

export default Register
