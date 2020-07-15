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
        // flexGrow: 1,
        padding: 50


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
            direction="column"
            justify="center"
            alignItems="center"
            spacing={3}
            // style={{
            //     minHeight: '20vh',
            // }}
      >
          <Grid container
                justify="center"
                // alignItems="center"
                style={{
                width: "60%",
            }}>
            <Typography className={classes.font}> Attend an event
            </Typography>
          </Grid>
          <Grid item style={{
                width: "60%",
            }}>
              <Button variant="contained" className={classes.button} onClick={() =>
                  history.push("/browse/add_event")}>
                  Add Event</Button>
          </Grid >
          <Grid item style={{
                width: "60%",
            }}>
              <EventList/>
          </Grid>
      </Grid>
    </div>
  );
}
