import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import Button from "@material-ui/core/Button";
import Style from "../lib/Style";
import EventList from "../components/event/EventList";
import {
    useHistory,
} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: '100%',
        margin: '0%',
    },
    button: {
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
    font: {
        fontFamily: Style.FontFamily,
        fontSize: "24px",
    },
}));

export default function Events(props) {
    const classes = useStyles();
    const history = useHistory();
    const [eventLs, setEventLs] = useState([]);

    useEffect(() => {
        props.eventsService.getAllEvents().then(setEventLs).catch(e => {console.log(e);throw e;});
    }, [props.eventsService]);

    return <Grid
        container
        direction="column"
        justify='center'
        alignItems="center"
    >
        <Grid item xs={10} sm={8} md={3} style={{marginTop: '1%', textAlign: 'center', width:'100%'}}>
            <Button variant="contained" fullWidth className={classes.button} onClick={() => history.push("/browse/events/add")}>Add Event</Button>
        </Grid >
        <Grid item xs={9} md={10} style={{width: '100%'}}>
            <EventList eventLs={eventLs}/>
        </Grid>
    </Grid>
}

