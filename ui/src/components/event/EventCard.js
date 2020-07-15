import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";

const useStyles = makeStyles({
    root: {
        // minWidth: ,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 24,
        fontFamily: Style.FontFamily,
    },
    pos: {
        marginBottom: 12,
    },
    button: {
        color: Style.Purple,
        fontSize: "16px",
    }
});

function EventCard() {
    const classes = useStyles();

    return <Card  className={classes.root} variant="outlined">
            <CardContent >
                <Typography className={classes.title}  gutterBottom>
                    Event Name
                </Typography>
                <Typography variant="body2" style={{fontFamily: Style.FontFamily}} gutterBottom>
                    Event TIme
                </Typography>
                <Typography variant="body1" style={{fontFamily: Style.FontFamily, fontSize: 16}} >
                    Event Description
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" className={classes.button}>Learn More</Button>
            </CardActions>
        </Card>

}

export default EventCard


