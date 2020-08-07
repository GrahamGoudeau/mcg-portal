import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Style from "../lib/Style";
import TextField from "@material-ui/core/TextField";
import 'date-fns';
import DateAndTime from "../components/utils/DateAndTime";



const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        justifyContent: 'space-around',
        flexGrow: 1,
        padding: 30,
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

export default function AddEvent(props) {
    const history=useHistory();
    const classes = useStyles();
    const [isEmpty, setIsEmpty] = useState(false);
    const [name, setName] = useState('')
    const [description, setDescription] = useState('');
    const endPoint = `/api/events`
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const handleDateChange = (date) => {setSelectedDate(date);};

    async function submitEvent() {
        const timeWithSeconds = selectedDate.toTimeString().split(" ", 1)[0];
        const components = timeWithSeconds.split(':');
        const time = components[0] + ':' + components[1];
        const date = selectedDate.toISOString().split("T")[0]

        return await props.serverClient.fetch(endPoint, {
            method: "POST",
            body: JSON.stringify({
                name,
                description,
                date,
                time,
            })
        }).then(r => {
            return r.json();
        }).catch(e => {
            return "Unexpected"
        })
    }

  return (
    <div className={classes.root} >
      <Grid container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={5}
            sm={10} md={8} lg={6}
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
                spacing={5}
                >
              <Grid item >
                  <TextField error={isEmpty}
                             id="event_name"
                             label="Event Name"
                             variant="outlined"
                             fullWidth
                             onChange={e => {
                                 setName(e.target.value);
                                 setIsEmpty(false);
                             }}/>
              </Grid>
              <Grid item >
                  <TextField id="event_details"
                             label="Details, links, etc."
                             multiline rows={5}
                             variant="outlined"
                             fullWidth
                             onChange={e => {
                                 setDescription(e.target.value);
                             }}/>
              </Grid>
              <Grid item >
                  <DateAndTime id={"date_time"} dataTime={selectedDate} handleChange={handleDateChange}/>
              </Grid>
              <Grid item >
                  <Button variant="contained" className={classes.button} fullWidth
                          onClick={() => {
                              if (name === "") {
                                  setIsEmpty(true)
                              } else {
                                  try {
                                      submitEvent();
                                      alert("Event submitted for approval by the MCG staff. Until it is approved, it will not be visible in the list of events. Check back soon!");
                                      history.push('/browse/events');
                                  } catch (e) {
                                      console.log(e)
                                  }
                              }
                          }}>Submit</Button>
              </Grid>
              <Grid item >
                  <Button variant="contained" className={classes.button} fullWidth
                          onClick={() => history.goBack()}>
                      Back</Button>
              </Grid>
          </Grid>
      </Grid>
    </div>
  );
}
