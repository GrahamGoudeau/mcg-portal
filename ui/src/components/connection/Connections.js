
import React, {useState, useEffect} from 'react';
import { Grid, Paper, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../../lib/Style'
import UseAsyncState from "../../lib/Async";

const useStyles = makeStyles(theme => ({
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        fontSize: '16px',
        color: 'white',
        width: '100%',
        '&:hover': {
            backgroundColor: Style.Tan,
        },
        marginLeft: '0',
        marginTop: '5vh',
        textTransform: 'none',
        padding: theme.spacing(2),
        alignSelf: 'stretch',
        whiteSpace: 'nowrap',
    },
    paper: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        fontSize: '16px',
        padding: theme.spacing(1),
        whiteSpace: 'nowrap',
        textTransform: 'none',
        borderRadius: '5px',
        width: '95%',
    },
    container: {
        paddingTop: '15vh',
        paddingBottom: '15vh',
        marginLeft: '12px',
        marginRight: '12px',
        marginBottom: '62px',
        maxWidth: '100%'
    },
    account: {

    }
}));

function Connections(props) {
    const classes = useStyles();
    const [connectionsList, setConnectionsList] = UseAsyncState({
        data: [],
    });

    async function getConnectionsList() {
        const url = `${props.hostname}/api/accounts`;
        return fetch(url,{method: 'GET',}).then(r => {
            return r.json();
        }).then(body => {
            setConnectionsList({
                data: body,
            });
        }).catch(e => {
            console.log(e);
            throw e;
        })
    }

    useEffect(() => {
        getConnectionsList();
    }, []);

    const listAccounts = connectionsList.data.map((account) =>
        <Account account={account}/>
    );

    return (
        <Grid
            container
            className={classes.container}
            spacing={1}
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
                margin: '0px',
                width: '100%',
            }}>
                <Grid item sm={9} md={5} lg={5}>
                    <p> Connect With Others </p>
                    {listAccounts}
                </Grid>
        </Grid>
    )
}

function Account(props) {
    const classes = useStyles();
    const [accountInfo, setAccountInfo] = useState({
        firstName: props.account.firstName,
        lastInitial: props.account.lastInitial,
        enrollmentStatus: props.account.enrollmentStatus,
    });

    return (
        <Grid container direction="column">
            <Grid container>
                <p>{accountInfo.firstName} {accountInfo.lastInitial}.</p>
                <EnrollmentStatusAndResource
                    enrollmentStatus={accountInfo.enrollmentStatus}
                    resources={props.account.resources}
                />
                <Button variant="contained" className={classes.button}>Request Connection</Button>
            </Grid>
        </Grid>
    )
}

function EnrollmentStatusAndResource(props) {
    const classes = useStyles();
    const [enrollmentStatus, setEnrollmentStatus] = useState(props.enrollmentStatus);
    const [resources, setResources] = useState({
        data: props.resources,
    });

    function renderEnrollmentStatus() {
        console.log(enrollmentStatus);
        if (enrollmentStatus != null) {
            return(
                <Grid item xs={calculateGridSize(enrollmentStatus)}>
                    <Paper className={classes.paper}>{enrollmentStatus}</Paper>
                </Grid>
            )
        }
    }

    const listResources = resources.data.map((r) =>
        <Grid item xs={calculateGridSize(r)}>
            <Paper className={classes.paper}>{r}</Paper>
        </Grid>
    );

    function calculateGridSize(r) {
        if (r.length <= 15) {
            return 6;
        } else if (r.length <= 25){
            return 8;
        }
        return 12;
    }

    return (
        <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justify="flex-start"
            style={{maxWidth: '95%'}}
        >
            {renderEnrollmentStatus()}
            {listResources}
        </Grid>
    )
}

export default Connections;
