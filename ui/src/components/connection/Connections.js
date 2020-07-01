import React, {useState} from 'react';
import Box from '@material-ui/core/Box';
import { Grid, Paper, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../../lib/Style'

const useStyles = makeStyles(theme => ({
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        fontSize: '16px',
        color: 'white',
        width: '100%',
        maxWidth: '100%',
        '&:hover': {
            backgroundColor: Style.Tan,
        },
        marginLeft: '0',
        marginTop: '5vh',
        textTransform: 'none',
        padding: theme.spacing(2),
        alignSelf: 'stretch',
    },
    paper: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        fontSize: '16px',
        width: '90%',
        maxWidth: '100%',
        padding: theme.spacing(1),
    },
    container: {
        marginTop: '24px',
        marginLeft: '12px',
        marginRight: '12px',
        marginBottom: '62px',
        maxWidth: '100%',
    },
}));

function Connections(props) {
    // const const url = `${this.hostname}/api/accounts`;
    // const accounts = fetch()
    const classes = useStyles();

    return (
        <Grid
            container
            className={classes.container}
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{
                textAlign: 'center',
                fontFamily: 'Open Sans',
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: '24px',
                background: Style.White,
                color: Style.NavyBlue,
            }}>
                <p> Connect With Others </p>
                <Grid item>
                    <Account />
                </Grid>
                <Grid item>
                    <Account />
                </Grid>
                <Grid item>
                    <Account />
                </Grid>
        </Grid>
    )
}

function Account(props) {
    const classes = useStyles();

    return (
        <Grid container direction="column" justify="flex-start">
            <p style={{marginLeft: '0px'}}>Joshua F.</p>
            <Grid item sm={12} md={12} lg={12} justify="flex-start">
                <Resource />
            </Grid>
            <Grid item sm={12} md={12} lg={12} justify="flex-start">
                <Button variant="contained" className={classes.button}>Request Connection</Button>
            </Grid>
        </Grid>
    )
}

function Resource(props) {
    const classes = useStyles();

    return (
        <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justify="flex-start"
        >
                <Grid item sm={6} md={6} lg={6}>
                    <Paper className={classes.paper} elevation={0}>Current Student</Paper>
                </Grid>
                <Grid item sm={6} md={6} lg={6}>
                    <Paper className={classes.paper} elevation={0}>Interview Prep</Paper>
                </Grid>
                <Grid item sm={6} md={6} lg={6}>
                    <Paper className={classes.paper} elevation={0}>Mentorship</Paper>
                </Grid>
        </Grid>
    )
}

export default Connections;
