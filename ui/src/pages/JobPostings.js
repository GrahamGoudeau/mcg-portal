import React, {useEffect, useState} from "react";
import {
  useHistory,
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
    LearnMore: {
      fontFamily: Style.FontFamily,
      color: Style.Purple,
      textAlign:'left',
      padding: '0',
      margin: '0',
      fontWeight: '600'
    },
    dateAndTime: {
        fontSize: "12px",
        lineHeight: "16px",
        marginBottom: '2vh',
        fontFamily: Style.FontFamily,
    },
    Button: {
      fontFamily: Style.FontFamily,
      backgroundColor: Style.Purple,
      color: 'white',
      width: '30%',
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.Blue,
      },
      marginTop: '0vh',
      marginBottom: '4vh',
      marginLeft: '2vh',
      paddingTop: '2vh',
      paddingBottom: '2vh',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      fontFamily: Style.FontFamily,
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
    card: {
      border: '1px solid #CFCFCF',
      boxSizing: 'border-box',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      backgroundColor: Style.White,
    },
    title: {
        flexGrow: 1,
        fontFamily: Style.FontFamily,
    },
    bar: {
        background: Style.Blue,
    }
}));

function JobPostings(props){
  const classes = useStyles();
  const history = useHistory();
  const [info, setinfo] = useState([]);
  const url = `${props.hostName}/api/all_job_postings`;

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
          items.push(

            <Grid item xs = {12} sm={6} md={6} lg={6} >
              <Card className={classes.card} align="left">

                  <CardContent>
                      <Typography className={classes.job}> {info[0].jobPostings[index].title}
                      </Typography>

                      <Typography className={classes.basicInfo}> {info[0].jobPostings[index].location}
                      </Typography>

                      <Button align='Left' className={classes.LearnMore} onClick={() => history.push("/browse/jobs/" + info[0].jobPostings[index].id)}>
                          Learn more
                      </Button>

                  </CardContent>
                </Card>
              </Grid>

          )
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
        <br/> <br/> <br/>
        <Typography style={{fontSize: '24px', lineHeight: '33px', fontFamily:"Open Sans"}}>
            Find a job opportunity
        </Typography>
        <br/>

        <Grid xs = {9} sm={8} md={6} lg={6} container spacing = {3}>
            <Button className={classes.Button}>
            Add Job
            </Button>
        </Grid>

            <Grid xs = {9} sm={8} md={6} lg={6} container spacing = {3}>
                {items}
            </Grid>

        </Grid>

  );

}

export default JobPostings
