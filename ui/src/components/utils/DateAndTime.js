import 'date-fns'
import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDateTimePicker,
} from '@material-ui/pickers';


export default function DateAndTime() {
  // The first commit of Material-UI
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justify="space-around">
        <KeyboardDateTimePicker
            fullWidth
            variant="inline"
            ampm={false}
            label="Event Date && Time"
            value={selectedDate}
            onChange={handleDateChange}
            onError={console.log}
            disablePast
            format="yyyy/MM/dd HH:mm"
      />
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
