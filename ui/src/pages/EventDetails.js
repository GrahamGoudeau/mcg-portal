import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../lib/Style";
import {useHistory, useParams} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import moment from "moment";


const useStyles = makeStyles({
    root: {
        flexGrow: 1
    },
    title: {
        fontSize: 24,
        fontFamily: Style.FontFamily,
    },
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        fontSize: "16px",
        color: 'white',
        '&:hover': {
            backgroundColor: Style.NavyBlue,
        },
    },
});

function EventDetails(props) {
    const classes = useStyles();
    const history = useHistory();
    const match = useParams();
    const [obj, setObj] = useState(null);
    const { eventsService } = props;

    useEffect( () => {
        eventsService.getAllEvents()
            .then(allEvents => allEvents.filter(event => {console.log(event.id, match.id, parseInt(match.id, 10), event.id === parseInt(match.id, 10)); return event.id === parseInt(match.id, 10)}))
            .then(matchingEvents => { console.log(matchingEvents, matchingEvents.length); return matchingEvents.length === 1 ? setObj(matchingEvents[0]) : setObj(null)})
    }, [eventsService, match.id]);

    console.log(obj)
    return obj == null ? null : <Grid
        container
        className = {classes.root}
        spacing={0}
        direction="column"
        alignItems="center"
        justify="flex-start"
        style={{
          fontSize: '36px',
          color: Style.NavyBlue,
        }}
    >
        <Grid item xs={12} md={6} style={{width: '100%'}}>
            <Card variant={"outlined"} style={{margin: '3vh'}}>
                <CardContent >
                    <Grid item container justify="center">
                        <Typography className={classes.title}  gutterBottom>
                            {obj.name}
                        </Typography>
                    </Grid>
                    <Typography variant="body2" style={{fontFamily: Style.FontFamily}} gutterBottom>{moment(obj.time).format("dddd, MMMM Do YYYY, h:mm a")}
                    </Typography>
                    <div style={{whiteSpace: 'pre-line'}}>
                        {obj.description}
                    </div>
                </CardContent>
                <CardActions>
                    <Button size="large" fullWidth className={classes.button} onClick={() => history.push('/browse/events')}>To All Events</Button>
                </CardActions>
            </Card>
        </Grid>
    </Grid>
}

export default EventDetails


