import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import Button from "@material-ui/core/Button";
import Style from "../../lib/Style";
import EventList from "./EventList";
import {
    Switch,
    Route,
    Redirect,
    useHistory,
    useRouteMatch,
} from "react-router-dom";
import AddEvent from "./AddEvent";
import EventDetails from "./EventDetails";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        justifyContent: 'space-around',
        flexGrow: 1,
        padding: 20,
    },
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        fontSize: "16px",
        color: 'white',

        '&:hover': {
            backgroundColor: Style.Tan,
        },
    },
    font: {
        fontFamily: Style.FontFamily,
        fontSize: "24px",
    },
}));

export default function Events(props) {
  const classes = useStyles();
  const history = useHistory();
  const url = `${props.hostName}/api/events`
  const [eventLs, setEventLs] = useState([])

  useEffect(() => {
    async function fetchEvents() {
      return await props.serverClient.fetch(url, {
        method: 'GET',
      });
    }

    fetchEvents().then(r => r.json()).then(r => setEventLs(r)).catch(e => {console.log(e);throw e;})
  }, [])

  return (
      <Switch>
          <Route exact path="/browse/events">
              <div className={classes.root} >
                  <Grid container
                        item
                        direction="column"
                        spacing={2}
                        sm={10} md={8} lg={6}
                        style={{display: 'flex',}}
                  >
                      <Grid item container justify="center">
                        <Typography className={classes.font}> Attend an event
                        </Typography>
                      </Grid>
                      <Grid item
                            >
                          <Button variant="contained" className={classes.button} onClick={() =>
                              history.push("/browse/events/add_event")}>
                              Add Event</Button>
                      </Grid >
                      <Grid item>
                          <EventList eventLs={eventLs}/>
                      </Grid>
                  </Grid>
              </div>
          </Route>
          <Route exact path={"/browse/events/add_event"}>
              <AddEvent hostName={props.hostName} serverClient={props.serverClient}/>
          </Route>
          <Route exact path={"/browse/events/details"}>
              <div className={classes.root} style={{marginTop: '10vh'}}>
                <EventDetails/>
              </div>
          </Route>
      </Switch>

  );
}

