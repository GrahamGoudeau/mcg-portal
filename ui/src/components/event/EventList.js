import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import EventCard from "./EventCard";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    // overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    height: "65vh",
  },
}));

export default function EventList(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList cellHeight={"auto"} className={classes.gridList} cols={1} spacing={20}>
        {props.eventLs.map((tile) => (
          <GridListTile key={tile.id}>
              <EventCard obj={tile}/>
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}
