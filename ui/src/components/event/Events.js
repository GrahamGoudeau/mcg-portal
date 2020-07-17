import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Style from "../../lib/Style";
import EventList from "./EventList";

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

export default function Events() {
  const classes = useStyles();
  const history = useHistory();

  return (
    <div className={classes.root} >
      <Grid container
            item
            direction="column"
            spacing={2}
            sm={10} md={8} lg={6}
            style={{
                display: 'flex',
            }}
      >
          <Grid item
                container
                justify="center"
                >
            <Typography className={classes.font}> Attend an event
            </Typography>
          </Grid>
          <Grid item
                >
              <Button variant="contained" className={classes.button} onClick={() =>
                  history.replace("/browse/events/add_event")}>
                  Add Event</Button>
          </Grid >
          <Grid item
                >
              <EventList/>
          </Grid>
      </Grid>
    </div>
  );
}
