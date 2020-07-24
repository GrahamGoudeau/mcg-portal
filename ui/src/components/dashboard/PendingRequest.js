import React, {useEffect, useState} from 'react';
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Name from "../../lib/Name";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";

const useStyles = makeStyles(_ => ({
    card: {
        marginBottom: '5vh',
        textAlign: 'center',
    },
    cardText: {
        fontFamily: Style.FontFamily,
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

function PendingRequest(props) {
    const classes = useStyles();
    const { request } = props;
    
    return <Card className={classes.card} key={request.id}>
        <CardContent>
            <Typography className={classes.cardText} variant="h5" component="h2">
                {Name(request.requester.name)}
            </Typography>
            <Typography className={classes.cardText} color="textSecondary">
                requesting contact with {Name(request.requestee.name)}
            </Typography>
            <Typography className={classes.cardText} color="textSecondary" style={{marginBottom: '15px'}}>
                Click <a href={buildMailToLink(request)}>this link</a> to compose an email introduction
            </Typography>
            <Typography className={classes.cardText} variant="body1">
                {request.message}
            </Typography>
            <Button variant="contained" className={classes.button}
                    onClick={() => props.onResolve(request.id)}>Clear Notification</Button>
        </CardContent>
    </Card>
}

function buildMailToLink(request) {
    return `mailto:${request.requestee.email}?cc=${request.requester.email}&?subject=MCG%20Alumni%20Portal%3A%20Networking%20Request&body=Hi%20${Name(request.requestee.name)}%2C%0D%0A%0D%0A${Name(request.requester.name)}%20found%20your%20profile%20on%20the%20MCG%20Alumni%20Portal%2C%20and%20would%20like%20to%20connect.%20They%20are%20cc'd%20here.`
}

export default PendingRequest;
