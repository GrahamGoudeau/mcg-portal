import React, {useState, useEffect} from 'react';
import {Grid} from "@material-ui/core";
import Badge from './Badge';

function BadgeGrid(props) {
    const badgeGridItems = props.badges.map((badgeObj, i) => {
        return <Grid key={badgeObj.name + i} item xs={12} sm={6} md={4} lg={4} style={{paddingTop: '0%', minWidth: '20%'}}>
            <Badge onDelete={props.onBadgeDelete} badgeObj={badgeObj} allowEdits={props.allowEdits}/>
        </Grid>
    });

    return <Grid container spacing={3} style={{marginTop: '1%'}}>
        {props.enrollmentType ? <Grid item xs={6} sm={4} md={3} lg={3} style={{paddingTop: '0%', minWidth: '20%'}}>
            <Badge badgeObj={{name: props.enrollmentType}} allowEdits={false}/>
        </Grid> : null}
        {badgeGridItems}
    </Grid>
}

export default BadgeGrid;
