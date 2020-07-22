import React, {useEffect, useState} from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../lib/Style'
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AuthService from '../svc/AuthService.js'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
        flexGrow: 1
    },
    jobTitle: {
        fontSize: "24px",
        lineHeight: "33px",
        marginBottom: '3vh',
        fontFamily: Style.FontFamily,
    },
    dateAndTime: {
        fontSize: "12px",
        lineHeight: "16px",
        marginBottom: '2vh',
        fontFamily: Style.FontFamily,
    },
    description: {
        fontSize: "16px",
        lineHeight: "22px",
        marginBottom: '4vh',
        fontFamily: Style.FontFamily,
    },
    Button: {
      fontFamily: Style.FontFamily,
      backgroundColor: Style.Purple,
      color: 'white',
      width: '100%',
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.Blue,
      },
      paddingTop: '2vh',
      paddingBottom: '2vh',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      align: 'Center',
    },
    job: {
      fontFamily: Style.FontFamily,
      fontSize: '24px',
      lineHeight: '33px'
    },
    basicInfo: {
      fontFamily: Style.FontFamily,
    },
    gridRow: {
        width: '100%', display: 'flex', fontFamily: Style.FontFamily
    }
}));

function CurrentJob(props){
    const classes = useStyles();
    const history = useHistory();
    const match = useParams();
    const [info, setinfo] = useState(null);

    useEffect( () => {
        props.jobsService.getJob(match.id).then(setinfo);
    }, [match.id]);

    const postingDate = info == null ? null : new Date(info.post_time);
    const postingDateToRender = postingDate == null ? null : postingDate.getFullYear()+'/'+(postingDate.getMonth()+1)+'/'+postingDate.getDate();


    return info == null ? null : <div style={{padding: '3%'}}>
        <Grid
            container
            direction="column"
            alignContent="center"
            alignItems="center"
            justify="flex-start"
        >
            <Grid
                item
                xs={10} sm={9} md={6} lg={6}
                className={classes.gridRow}
            >
                <Paper elevation={5} style={{width: '100%'}}>
                    <div style={{padding: '2%'}}>
                        <Grid
                            container
                            direction="column"
                            alignContent="center"
                            alignItems="center"
                            justify="flex-start"
                        >
                            <Grid item xs={12} style={{textAlign: "center"}}>
                                <Typography className={classes.basicInfo} variant="h5">
                                    {info.title}
                                </Typography>
                                <Typography className={classes.basicInfo} color="textSecondary">
                                    Location: {info.location}
                                </Typography>
                                <Typography className={classes.basicInfo} color="textSecondary">
                                    Posted: {postingDateToRender}
                                </Typography>
                            </Grid>
                            <Grid item alignText="center" alignContent="center" justify="center" xs={12} className={classes.gridRow}>
                                <div style={{width: '100%', whiteSpace: "pre-line"}}>
                                    <hr/>
                                    {info.description}
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                </Paper>
            </Grid>

        </Grid>
    </div>
}

export default CurrentJob
