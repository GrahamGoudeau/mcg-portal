import 'date-fns'
import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDateTimePicker, MuiPickersUtilsProvider,} from '@material-ui/pickers';

export default function DateAndTime(props) {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container justify="space-around">
                <p>Click the Calendar icon below for a convenient time selection tool.</p>
                <KeyboardDateTimePicker
                    fullWidth
                    variant="inline"
                    label="Date & Time"
                    value={props.dataTime}
                    onChange={props.handleChange}
                    format="yyyy/MM/dd hh:mm a"
                />
            </Grid>
        </MuiPickersUtilsProvider>
    );
}
