import React from 'react';
import EventCard from "./EventCard";
import Grid from '@material-ui/core/Grid';

export default function EventList(props) {
    return <Grid container spacing={3} direction={props.eventLs.length > 3 ? 'row' : 'column'} justify='center' alignItems='center'>
        {props.eventLs.map((event, index) => {
            return <Grid key={index} item xs={12} sm={12} md={6} lg={4} style={{width: '100%'}}>
                <EventCard obj={event}/>
            </Grid>
        })}
    </Grid>
}
