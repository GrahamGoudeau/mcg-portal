import React, {useEffect, useState} from 'react';
import {Grid} from "@material-ui/core";
import Style from "../lib/Style";
import {makeStyles} from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Name from "../lib/Name";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
    container: {
        textAlign: 'center',
        fontFamily: Style.FontFamily,
        background: Style.White,
        height: '93%',
        overflow: 'scroll',
        width: '100%',
    },
    card: {
        marginBottom: '5vh',
    },
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
    cardText: {
        fontFamily: Style.FontFamily,
    }
}));

function Dashboard(props) {
    const classes = useStyles();
    const [list, setList] = useState([]);
    const [dataVersion, setDataVersion] = useState(0); // number of times we've updated the data. Increment to refresh the data

    useEffect(() => {
        function buildResolveAndRefreshCallback(requestId) {
            return async () => {
                /*eslint no-restricted-globals: [0]*/
                if (confirm("Are you sure you'd like to resolve this connection request?")) {
                    await props.connectionsService.resolveConnectionRequest(requestId);
                    setDataVersion(dataVersion + 1);
                }
            }
        }

        props.connectionsService
            .getAllConnectionRequests()
            .then(result => result.filter(request => !request.resolved))
            .then(pendingRequests => pendingRequests.map(pending =>
                    <Card className={classes.card} key={pending.id}>
                        <CardContent>
                            <Typography className={classes.cardText} variant="h5" component="h2">
                                {Name(pending.requester.name)}
                            </Typography>
                            <Typography className={classes.cardText} color="textSecondary">
                                requesting contact with {Name(pending.requestee.name)}
                            </Typography>
                            <Typography className={classes.cardText} color="textSecondary" style={{marginBottom: '15px'}}>
                                Click <a href={buildMailToLink(pending)}>this link</a> to compose an email introduction
                            </Typography>
                            <Typography className={classes.cardText} variant="body1">
                                {pending.message}
                            </Typography>
                            <Button variant="contained" className={classes.button}
                                    onClick={buildResolveAndRefreshCallback(pending.id)}>Clear Notification</Button>
                        </CardContent>
                    </Card>
                )
            ).then(setList);
    }, [dataVersion, props.connectionsService]);

    let requests = null;
    if (list.length > 0) {
        requests = list;
    } else {
        requests = <h4>All requests have been resolved!</h4>
    }

    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="flex-start"
            style={{
                minHeight: '100vh',
                textAlign: 'center',
                fontFamily: 'Open Sans',
                fontStyle: 'normal',
                fontWeight: 'normal',
                color: Style.NavyBlue,
            }}
        >
            <Grid item xs={12}>
                <h1>Pending Connection Requests</h1>
                {requests}
            </Grid>
        </Grid>
    )
}

function buildMailToLink(request) {
    return `mailto:${request.requestee.email}?cc=${request.requester.email}&?subject=MCG%20Alumni%20Portal%3A%20Networking%20Request&body=Hi%20${Name(request.requestee.name)}%2C%0D%0A%0D%0A${Name(request.requester.name)}%20found%20your%20profile%20on%20the%20MCG%20Alumni%20Portal%2C%20and%20would%20like%20to%20connect.%20They%20are%20cc'd%20here.`
}

export default Dashboard;
