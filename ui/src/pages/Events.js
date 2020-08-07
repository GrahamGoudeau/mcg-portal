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
        flexGrow: 1,
        maxWidth: '100%',
    },
    button: {
      backgroundColor: Style.Orange,
      color: 'white',
      maxWidth: '100%',
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
    const endPoint = `/api/events`
    const [eventLs, setEventLs] = useState([])

    useEffect(() => {
        async function fetchEvents() {
            return await props.serverClient.fetch(endPoint, {
                method: 'GET',
            });
        }

        fetchEvents().then(r => r.json()).then(r => setEventLs(r)).catch(e => {console.log(e);throw e;})
    }, [props.serverClient]);

    return <Grid container
        className = {classes.root}
        spacing={3}
        direction="column"
        alignItems="center"
        justify="flex-start"
        style={{
            textAlign: 'center',
            fontSize: '36px',
            color: Style.NavyBlue,
        }}
    >
        <Typography variant="h4" style={{margin: '3vh', fontFamily: Style.FontFamily}}>
            Attend an event
        </Typography>
        <Grid item xs={9} md={10}>
            <Button variant="contained" className={classes.button} onClick={() => history.push("/browse/events/add")}>Add Event</Button>
        </Grid >
        <Grid item xs={9} md={10} style={{width: '100%'}}>
            <EventList eventLs={eventLs}/>
        </Grid>
    </Grid>
}

