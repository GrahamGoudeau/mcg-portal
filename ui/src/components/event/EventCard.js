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
    title: {
        fontFamily: Style.FontFamily,
        fontSize: '24px',
        lineHeight: '33px'
    },
    pos: {
        marginBottom: 12,
    },
    button: {
        color: Style.Purple,
        fontSize: "16px",
    },
    card: {
        border: '1px solid #CFCFCF',
        boxSizing: 'border-box',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    },
    basicInfo: {
        fontFamily: Style.FontFamily,
        fontSize: '16px',
        lineHeight: '22px',
        paddingTop: '2vh'
    },
    LearnMore: {
        fontFamily: Style.FontFamily,
        color: Style.Purple,
        textAlign:'left',
        padding: '0',
        margin: '0',
        fontWeight: '600'
    },
});

function EventCard(props) {
    const classes = useStyles();
    const history = useHistory();
    const obj = props.obj
    const eventDate = new Date(obj.date + 'T' + obj.time).toLocaleString()

    return  <Card className={classes.card} align={"left"}>
                <CardContent >
                    <Typography className={classes.title}  gutterBottom>
                        {obj.name}
                    </Typography>
                    <Typography variant="body2" className={classes.basicInfo} style={{fontFamily: Style.FontFamily}}
                                gutterBottom>{eventDate}
                    </Typography>
                    <HTMLEllipsis
                        className={classes.basicInfo}
                        unsafeHTML={obj.description}
                        maxLine={2}
                        basedOn='letters'
                        ellipsis='...'/>
                </CardContent>
                <CardActions>
                    <Button size={"small"}
                            className={classes.button}
                            onClick={() => history.push("/browse/events/" + obj.id)}>
                        Learn More</Button>
                </CardActions>
    </Card>
}

export default EventCard


