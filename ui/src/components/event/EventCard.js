import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";
import HTMLEllipsis from 'react-lines-ellipsis/lib/html'
import {useHistory} from "react-router-dom";




const useStyles = makeStyles({
    root: {
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

function EventCard(props) {
    const classes = useStyles();
    const history = useHistory();
    const obj = props.obj
    const eventDate = new Date(obj.date + 'T' + obj.time).toLocaleString()

    return <Card variant={"outlined"} className={classes.root}  >
            <CardContent >
                <Typography className={classes.title}  gutterBottom>
                    {obj.name}
                </Typography>
                <Typography variant="body2" style={{fontFamily: Style.FontFamily}} gutterBottom>{eventDate}</Typography>
                    <HTMLEllipsis
                    unsafeHTML={obj.description}
                    maxLine={2}
                    basedOn='letters'
                    ellipsis='...'/>
            </CardContent>
            <CardActions>
                <Button size="small" className={classes.button}
                        onClick={() => history.push(`/browse/events/details/${obj.id}`,
                    obj)}>
                    Learn More</Button>
            </CardActions>
        </Card>
}

export default EventCard


