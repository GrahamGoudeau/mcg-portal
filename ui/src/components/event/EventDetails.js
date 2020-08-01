import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";
import {useHistory, useParams} from "react-router-dom";
import Grid from "@material-ui/core/Grid";


const useStyles = makeStyles({
    root: {
        flexGrow: 1
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

function EventDetails(props) {
    const classes = useStyles();
    const history = useHistory();
    const match = useParams();
    const [obj, setObj] = useState(null);

    useEffect( () => {
        props.eventsService.getEvent(match.id).then(setObj);
    }, [match.id]);

    if (obj == null) return null;

    const eventDate = new Date(obj.date + 'T' + obj.time).toLocaleString()

    return <Grid
        container
        className = {classes.root}
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="flex-start"
                        style={{
                          minHeight: '100vh',
                          textAlign: 'center',
                          fontSize: '36px',
                          color: Style.NavyBlue,
                        }}
        >
        <Grid item
              sm={10} md={8} lg={6}>
                    <Card variant={"outlined"} style={{margin: '3vh'}}>
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
    </Grid>
}

export default EventDetails


