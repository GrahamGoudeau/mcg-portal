import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import Button from "@material-ui/core/Button";
import Style from "../../lib/Style";
import EventList from "./EventList";
import {
    useHistory,
} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    },
    button: {
      backgroundColor: Style.Purple,
      color: 'white',
      width: '30%',
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.Blue,
      },
      marginTop: '0vh',
      marginBottom: '4vh',
      marginLeft: '2vh',
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
  }, [])

  return <div >
            <Grid container
                        className = {classes.root}
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="flex-start"
                        style={{
                          minHeight: '100vh',
                          textAlign: 'center',
                          fontSize: '36px',
                          color: Style.NavyBlue,
                        }}
                  >
                      <Typography variant="h4" style={{margin: '3vh', fontFamily: Style.FontFamily}}>
                          Attend an event
                      </Typography>
                      <Grid item xs={9} sm={8} md={6} lg={6} container spacing = {3} justify="flex-start" >
                          <Button variant="contained" className={classes.button} onClick={() =>
                              history.push("/browse/events/add")}>
                              Add Event</Button>
                      </Grid >
                      <Grid item xs = {9} sm={8} md={6} lg={6} container spacing={3} justify="flex-start">
                          <EventList eventLs={eventLs} eventsService={props.eventsService}/>
                      </Grid>
                  </Grid>
              </div>
}

