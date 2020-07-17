import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import EventCard from "./EventCard";

const useStyles = makeStyles((theme) => ({
  root: {
    // display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    height: "60vh",
  },
}));

/**
 * The example data is structured as follows:
 *
 * import image from 'path/to/image.jpg';
 * [etc...]
 *
 * const tileData = [
 *   {
 *     img: image,
 *     title: 'Image',
 *     author: 'author',
 *     cols: 2,
 *   },
 *   {
 *     [etc...]
 *   },
 * ];
 */
export default function EventList() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList cellHeight={"auto"} className={classes.gridList} cols={1} spacing={20}>
        {[1, 2, 3, 4, 5, 6, 7].map((tile) => (
          <GridListTile key={tile}>
              <EventCard/>
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}
