import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Style from "../../lib/Style";
import TextField from "@material-ui/core/TextField";
import 'date-fns';
import DateAndTime from "../utils/DateAndTime";

const useStyles = makeStyles((theme) => ({
    root: {
        // flexGrow: 1,
        padding: 50,
        justify: "center",
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

export default function AddEvent() {
  const classes = useStyles();
  // const history = useHistory();

  return (
    <div className={classes.root} >
      <Grid container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={3}

      >
          <Grid item
                container
                justify="center"
                >
            <Typography className={classes.font}> Add a new event to share</Typography>
          </Grid>
          <Grid item
                container
                direction={"column"}
                spacing={3}
                style={{width: "40%"}}>
              <Grid item >
                  <TextField id="outlined-basic" label="Event Name" variant="outlined" fullWidth/>
              </Grid>
              <Grid item >
                  <TextField id="outlined-basic" label="Details, links, etc." multiline rows={5} variant="outlined" fullWidth/>
              </Grid>
              <Grid item >
                  <DateAndTime/>
              </Grid>
              <Grid item >
                  <Button variant="contained" className={classes.button} fullWidth>Submit</Button>
              </Grid>
              <Grid item >
                  <Button variant="contained" className={classes.button} fullWidth>Back</Button>
              </Grid>
          </Grid>
      </Grid>
    </div>
  );
}
