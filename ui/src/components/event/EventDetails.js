import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";
import { useLocation, useHistory } from "react-router-dom";
import Grid from "@material-ui/core/Grid";


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
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        fontSize: "16px",
        color: 'white',

        '&:hover': {
            backgroundColor: Style.Tan,
        },
    },
});

function EventDetails() {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();

    // Receive passing state with history.location(useLocation)
    const obj = location.state
    const eventDate = new Date(obj.date + 'T' + obj.time).toLocaleString()

    return<Grid container
                item
                spacing={2}
                sm={10} md={8} lg={6}>
                    <Card variant={"outlined"} style={{width:'100%'}}>
                        <CardContent >
                            <Grid item container justify="center">
                                <Typography className={classes.title}  gutterBottom>
                                    {obj.name}
                                </Typography>
                            </Grid>
                            <Typography variant="body2" style={{fontFamily: Style.FontFamily}} gutterBottom>{eventDate}
                            </Typography>
                            <Typography style={{display: 'inline-block'}}><br/>{obj.description.split('\n').map(
                                (i, key) => {return <div key={key}>{i}<br/></div>})}</Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="large" fullWidth className={classes.button} onClick={() => history.goBack()}>
                                Back</Button>
                        </CardActions>
                    </Card>
                </Grid>
}

export default EventDetails


