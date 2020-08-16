import React, {useEffect, useState} from 'react';
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import AccountInfoGrid from "../components/account/AccountInfoGrid";
import Style from "../lib/Style";
import getContactEmail from "../lib/Contact";
import moment from 'moment';

const useStyles = makeStyles(() => ({
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
    const classes = useStyles();

    const [list, setList] = useState([]);
    const [dataVersion, setDataVersion] = useState(0); // number of times we've updated the data. Increment to refresh the data
    function refreshData() {
        setDataVersion(dataVersion + 1)
    }

    useEffect(() => {
        props.approvalRequestsService
            .getAllApprovalRequests()
            .then(setList)
    }, [dataVersion, props.connectionsService, setList, props.approvalRequestsService]);

    return (
        <div className={classes.root}>
            {list.length === 0 ? <h2>Nothing to review!</h2> :
                <Grid container spacing={0} direction='column' justify='center' alignItems='center'
                      style={{marginTop: '2%', maxWidth: '100%'}}>
                    {list.map(pendingRequest =>
                        <Grid key={pendingRequest.metadata.id} item style={{width: '100%', marginBottom: '3%'}} xs={10}
                              md={6}>
                            <Card elevation={5} style={{padding: '3%'}}>
                                {
                                    pendingRequest.account ?
                                        <AccountRequest pendingRequest={pendingRequest} classes={classes}
                                                        onApproval={buildRequestResponder(true, props, pendingRequest.metadata.id, refreshData)}
                                                        onReject={buildRequestResponder(false, props, pendingRequest.metadata.id, refreshData)}/>
                                        : pendingRequest.connection ?
                                        <ConnectionRequest pendingRequest={pendingRequest} classes={classes}
                                                           onApproval={buildRequestResponder(true, props, pendingRequest.metadata.id, refreshData)}
                                                           onReject={buildRequestResponder(false, props, pendingRequest.metadata.id, refreshData)}>Connection</ConnectionRequest>
                                        : pendingRequest.event ?
                                            <EventRequest pendingRequest={pendingRequest} classes={classes}
                                                          onApproval={buildRequestResponder(true, props, pendingRequest.metadata.id, refreshData)}
                                                          onReject={buildRequestResponder(false, props, pendingRequest.metadata.id, refreshData)}>Event</EventRequest>
                                            : <p>Job</p>
                                }
                            </Card>
                        </Grid>
                    )}
                </Grid>}
        </div>
    )
}

function buildRequestResponder(accept, props, requestId, refreshData) {
    return async () => {
        if (accept) {
            await props.approvalRequestsService.approveRequest(requestId)
        } else {
            await props.approvalRequestsService.denyRequest(requestId);
        }
        refreshData();
    };
}

function EventRequest(props) {
    const {
        pendingRequest,
        classes,
    } = props;
    const event = pendingRequest.event;

    return <React.Fragment>
        <div style={{fontSize: '1.5em'}}>
            {pendingRequest.event?.isNewEvent ? 'New' : 'Update'} {capitalize(pendingRequest.metadata.type)} Request
        </div>
        <Grid container direction='row' style={{marginTop: '3%'}}>
            <Grid item xs={12}>
                <span style={{fontSize: '1.3em', textDecoration: 'underline'}}>{event.name}</span>
            </Grid>
            <Grid item xs={6}>
                {event.organizerName.firstName} {event.organizerName.lastName}
            </Grid>
            <Grid item xs={6}>
                {moment(event.time).format("dddd, MMMM Do YYYY, h:mm a")}
            </Grid>
            <Grid item xs={12} style={{marginTop: '3%', marginBottom: '3%'}}>
                {event.description}
            </Grid>
        </Grid>
        <DecisionButtons
            approveButtonClass={classes.approveButton}
            rejectButtonClass={classes.rejectButton}
            onApproval={props.onApproval}
            onReject={props.onReject}
        />
    </React.Fragment>
}

function ConnectionRequest(props) {
    const {
        pendingRequest,
        classes,
    } = props;

    return <React.Fragment>
        <div style={{fontSize: '1.5em'}}>
            {capitalize(pendingRequest.metadata.type)} Request
        </div>
        <p>
            {pendingRequest.connection.requesterName.firstName} {pendingRequest.connection.requesterName.lastName} ({pendingRequest.connection.requesterEmail})
        </p>
        <p>
            is requesting to connect with
        </p>
        <p>
            {pendingRequest.connection.requesteeName.firstName} {pendingRequest.connection.requesteeName.lastName} ({pendingRequest.connection.requesteeEmail})
        </p>
        <DecisionButtons
            approveButtonClass={classes.approveButton}
            rejectButtonClass={classes.rejectButton}
            confirmationText={`This will send an automated email to the two parties, and also cc'd to ${getContactEmail()}. Continue?`}
            onApproval={props.onApproval}
            onReject={props.onReject}
        />
    </React.Fragment>
}

function AccountRequest(props) {
    const {
        pendingRequest,
        classes,
    } = props;

    return <React.Fragment>
        <div style={{fontSize: '1.5em'}}>
            {pendingRequest.account?.isNewAccount ? 'New' : 'Update'} {capitalize(pendingRequest.metadata.type)} Request
        </div>
        <AccountInfoGrid account={{
            ...pendingRequest.account,
            name: `${pendingRequest.account.firstName} ${pendingRequest.account.lastName}`,
        }}/>
        <DecisionButtons
            approveButtonClass={classes.approveButton}
            rejectButtonClass={classes.rejectButton}
            onApproval={props.onApproval}
            onReject={props.onReject}
        />
    </React.Fragment>
}

function DecisionButtons(props) {
    return <Grid container spacing={1} direction='row' justify='center' alignItems='center' alignContent='center'>
        <Grid item xs={6} style={{width: '100%'}}>
            <Button className={props.approveButtonClass} variant='contained' style={{width: '75%'}} onClick={() => {
                if (props.confirmationText != null && props.confirmationText !== '') {
                    /*eslint no-restricted-globals: [0]*/
                    if (confirm(props.confirmationText)) {
                        props.onApproval();
                    }
                } else {
                    props.onApproval()
                }

            }}>Approve</Button>
        </Grid>
        <Grid item xs={6} style={{width: '100%'}}>
            <Button className={props.rejectButtonClass} variant='contained' style={{width: '75%'}}
                    onClick={props.onReject}>Reject</Button>
        </Grid>
    </Grid>
}

// function TabPanel(props) {
//     const {children, value, index, ...other} = props;
//
//     return (
//         <div
//             role="tabpanel"
//             hidden={value !== index}
//             id={`vertical-tabpanel-${index}`}
//             aria-labelledby={`vertical-tab-${index}`}
//             {...other}
//         >
//             {value === index && (
//                 <Box p={3}>
//                     <Typography>{children}</Typography>
//                 </Box>
//             )}
//         </div>
//     );
// }

const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
;

// function a11yProps(index) {
//     return {
//         id: `vertical-tab-${index}`,
//         'aria-controls': `vertical-tabpanel-${index}`,
//     };
// }

export default Dashboard;
