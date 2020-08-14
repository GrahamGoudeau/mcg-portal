import React, {useEffect, useState} from 'react';
import {Grid} from "@material-ui/core";
import PendingRequest from "../components/dashboard/PendingRequest";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AppBar from '@material-ui/core/AppBar';
import CardContent from "@material-ui/core/CardContent";
import Name from "../lib/Name";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import AccountInfoGrid from "../components/account/AccountInfoGrid";
import Style from "../lib/Style";

const useStyles = makeStyles((theme) => ({
    root: {
        textAlign: 'center',
    },
    approveButton: {
        backgroundColor: Style.Orange,
        color: 'white',
        width: '100%',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        '&:hover': {
            backgroundColor: Style.Tan,
        },
        paddingTop: '2vh',
        paddingBottom: '2vh',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        fontFamily: Style.FontFamily,
    },
    rejectButton: {
        backgroundColor: Style.Blue,
        color: 'white',
        width: '100%',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        '&:hover': {
            backgroundColor: Style.NavyBlue,
        },
        paddingTop: '2vh',
        paddingBottom: '2vh',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        fontFamily: Style.FontFamily,
    },
}));

function Dashboard(props) {
    console.log("Rendering dashboard")
    const classes = useStyles();

    const [list, setList] = useState([]);
    const [dataVersion, setDataVersion] = useState(0); // number of times we've updated the data. Increment to refresh the data
    const [value, setValue] = React.useState(0);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    async function resolveRequest(requestId) {
        /*eslint no-restricted-globals: [0]*/
        if (confirm("Are you sure you'd like to resolve this connection request?")) {
            await props.connectionsService.resolveConnectionRequest(requestId);
            setDataVersion(dataVersion + 1);
        }
    }

    useEffect(() => {
        props.approvalRequestsService
            .getAllApprovalRequests()
            .then(setList)
    }, [dataVersion, props.connectionsService]);

    const requests = list.map(pendingRequest =>
        <PendingRequest
            request={pendingRequest}
            onResolve={resolveRequest}
        />
    );

    return (
        <div className={classes.root}>
            {list.length === 0 ? <h2>Nothing to review!</h2> : <Grid container spacing={0} direction='column' justify='center' alignItems='center' style={{marginTop: '2%', maxWidth: '100%'}}>
                {list.map(pendingRequest =>
                    <Grid key={pendingRequest.metadata.id} item style={{width: '100%', marginBottom: '3%'}} xs={10} md={6}>
                        <Card elevation={5} style={{padding: '3%'}}>
                            <div style={{fontSize: '1.5em'}}>
                                {pendingRequest.account?.isNewAccount ? 'New' : 'Update'} {capitalize(pendingRequest.metadata.type)} Request
                            </div>
                            <AccountInfoGrid account={{
                                ...pendingRequest.account,
                                name: `${pendingRequest.account.firstName} ${pendingRequest.account.lastName}`,
                            }}/>
                            <DecisionButtons
                                approveButtonClass={classes.approveButton}
                                rejectButonClass={classes.rejectButton}
                                onApproval={() => {
                                    props.approvalRequestsService.approveRequest(pendingRequest.metadata.id)
                                }}
                                onReject={() => {
                                    props.approvalRequestsService.denyRequest(pendingRequest.metadata.id)
                                }}
                            />
                        </Card>
                    </Grid>
                )}
            </Grid>}
        </div>
    )
}

function DecisionButtons(props) {
    return <Grid container spacing={1} direction='row' justify='center' alignItems='center' alignContent='center'>
        <Grid item xs={6} style={{width: '100%'}}>
            <Button className={props.approveButtonClass} variant='contained' style={{width: '75%'}} onClick={props.onApproval}>Approve</Button>
        </Grid>
        <Grid item xs={6} style={{width: '100%'}}>
            <Button className={props.rejectButonClass} variant='contained' style={{width: '75%'}} onClick={props.onReject}>Reject</Button>
        </Grid>
    </Grid>
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
;

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default Dashboard;
