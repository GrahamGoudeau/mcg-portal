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
      fontSize: '16px',
      lineHeight: '22px',
      paddingTop: '2vh'
    },
    bar: {
        background: Style.Blue,
    }
}));

function CurrentJob(props){
  const classes = useStyles();
  const history = useHistory();
  const match = useParams();
  const [info, setinfo] = useState([]);
  const url = `${props.hostName}/api/all_job_postings`;

    useEffect( () => {
      fetch("api/jobs/" + match.id).then(console.log);
    }, [match.id]);


    useEffect(() => {
        async function fetchData() {
            return await props.serverClient.fetch(url, {
              method: 'GET'
            });
          }
        fetchData().then(r => r.json()).then(r => setinfo(r))},
        [])

    if(info.length != 0){
        console.log(info[0].jobPostings)
    }

    const items = [];

    if(info.length != 0){
      for (const [index, value] of info[0].jobPostings.entries()) {
            if(info[0].jobPostings[index].id == match.id){
              items.push(
                <Grid item xs={9} sm={6} md={5} lg={4} style={{width: '80%'}}>

                  <Typography className={classes.jobTitle}> {info[0].jobPostings[index].title} </Typography>

                  <Typography align='Left' className={classes.dateAndTime}> {info[0].jobPostings[index].post_time}
                  </Typography>

                  <Typography align="Left" className={classes.description}> {info[0].jobPostings[index].description}
                  </Typography>

                  <Button className={classes.Button} style={{fontFamily: "Open Sans"}} onClick={() => history.push("/browse/jobs")}> Back
                  </Button>
                </Grid>

              )
            }
        }
    }

    return (
          <Grid item sm={12} md={12} lg={12} className={classes.root}
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{
                  minHeight: '100vh',
                  textAlign: 'center',
                  fontFamily: 'Open Sans',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontSize: '36px',
                  background: Style.White,
                  color: Style.NavyBlue,
              }}
            >
                {items}

            </Grid>


    );
}

export default CurrentJob
