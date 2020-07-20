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
}));

function Dashboard(props) {
    const classes = useStyles();
    const [list, setList] = useState([]);

    useEffect(() => {
        props.connectionsService
            .getAllConnectionRequests()
            .then(result => result.filter(request => !request.resolved))
            .then(pendingRequests => {
                setList(pendingRequests.map(pending =>
                    <Card className={classes.card} key={pending.id}>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                {Name(pending.requesterName)}
                            </Typography>
                            <Typography color="textSecondary" style={{marginBottom: '5px'}}>
                                requesting contact with {Name(pending.requesteeName)}
                            </Typography>
                            <Typography variant="body1">
                                Click <a href="mailto:requestee@email.com?cc=requester@email.com&?subject=MCG%20Networking%20Request">this link</a> to compose an email introduction
                            </Typography>
                            <Button variant="contained" className={classes.button} onClick={() => console.log("clicked")}>Mark Resolved</Button>
                        </CardContent>
                    </Card>
                ));
            })
    }, []);

    console.log(list);
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
                background: Style.White,
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

export default Dashboard;
