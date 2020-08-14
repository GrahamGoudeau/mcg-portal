import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Grid from '@material-ui/core/Grid';
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Style from "../lib/Style";
import TextField from "@material-ui/core/TextField";
import 'date-fns';
import DateAndTime from "../components/utils/DateAndTime";
import moment from 'moment'
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
    paper: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        fontSize: '16px',
        textAlign: 'center',
        textTransform: 'none',
        borderRadius: '5px',
        width: '95%',
    },
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
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
    const history = useHistory();
    const classes = useStyles();
    const [isEmpty, setIsEmpty] = useState(false);
    const [name, setName] = useState('')
    const [description, setDescription] = useState('');
    const endPoint = `/api/v1/secure/events/`
    const [selectedDate, setSelectedDate] = React.useState(moment().add(1, 'days').hour(12).minute(0));
    const handleDateChange = (date) => {
        setSelectedDate(moment(date).second(0));
    };

    async function submitEvent() {
        return await props.serverClient.fetch(endPoint, {
            method: "POST",
            body: JSON.stringify({
                name,
                description,
                time: selectedDate.format(),
            })
        }).then(r => {
            return r.json();
        }).catch(e => {
            return "Unexpected"
        })
    }

    return (
        <Grid container alignItems='center' justify='center'>
            <Grid item xs={10} md={6}>
                <Paper elevation={5}>
                    <div style={{textAlign: 'center'}}>
                        <h2>Add a new event to share</h2>
                        <Grid container spacing={3} direction='column' alignItems='center' justify='center'>
                            <Grid item xs={12} sm={10} md={9} lg={9} style={{width: '100%'}}>
                                <TextField
                                    error={isEmpty}
                                    style={{width: '100%'}}
                                    autoComplete='off'
                                    id="event_name"
                                    label="Event Name"
                                    variant="outlined"
                                    onChange={e => {
                                        setName(e.target.value);
                                        setIsEmpty(false)
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={10} md={9} lg={9} style={{width: '100%'}}>
                                <div>
                                    <TextField
                                        label="Details"
                                        variant='outlined'
                                        multiline
                                        rows={7}
                                        onChange={e => {
                                            setDescription(e.target.value)
                                        }}
                                        style={{width: '100%'}}
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={10} md={9} lg={9} style={{width: '100%'}}>
                                <DateAndTime dataTime={selectedDate} handleChange={handleDateChange} variant='outlined'/>
                            </Grid>
                            <Grid item xs={12} sm={10} md={9} lg={9} style={{width: '100%'}}>
                                <Button
                                    variant='contained'
                                    className={classes.button}
                                    fullWidth
                                    onClick={async () => {
                                        if (name === '') {
                                            setIsEmpty(true)
                                        } else {
                                            await submitEvent();
                                            alert("Event submitted for approval by the MCG staff. Until it is approved, it will not be visible in the list of events. Check back soon!");
                                            history.push('/browse/events')
                                        }
                                    }}
                                >Submit</Button>
                            </Grid>
                        </Grid>
                    </div>
                </Paper>
            </Grid>
        </Grid>

        //         <Grid item>
        //             <Button variant="contained" className={classes.button} fullWidth
        //                     onClick={() => {
        //                         if (name === "") {
        //                             setIsEmpty(true)
        //                         } else {
        //                             try {
        //                                 submitEvent();
        //                                 alert("Event submitted for approval by the MCG staff. Until it is approved, it will not be visible in the list of events. Check back soon!");
        //                                 history.push('/browse/events');
        //                             } catch (e) {
        //                                 console.log(e)
        //                             }
        //                         }
        //                     }}>Submit</Button>
        //         </Grid>
        //         <Grid item>
        //             <Button variant="contained" className={classes.button} fullWidth
        //                     onClick={() => history.goBack()}>
        //                 Back</Button>
        //         </Grid>
        //     </Grid>
        // </div>
    );
}
