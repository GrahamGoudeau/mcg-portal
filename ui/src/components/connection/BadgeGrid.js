import React, {useState, useEffect} from 'react';
import {Grid} from "@material-ui/core";
import Badge from './Badge';

function BadgeGrid(props) {
    const badgeGridItems = props.badges.map((badgeText, i) => {
        console.log("Badge text", badgeText);
        return <Grid key={badgeText + i} item xs={6} sm={4} md={3} lg={3} style={{paddingTop: '0%', minWidth: '20%'}}>
            <Badge name={badgeText} allowEdits={props.allowEdits}/>
        </Grid>
    });

    return <Grid container spacing={3} style={{marginTop: '1%'}}>
        {badgeGridItems}
    </Grid>
}

export default BadgeGrid;
