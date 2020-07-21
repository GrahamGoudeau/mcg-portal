import React, {useEffect, useState} from "react";
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../lib/Style'
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    },
    LearnMore: {
      fontFamily: Style.FontFamily,
      color: Style.Purple,
      textAlign:'left',
      padding: 'none',
      margin: 'none'
    },
    Button: {
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
  const [info, setinfo] = useState({});

  useEffect(() => {
      props.jobsService.getAllJobs().then(setinfo);
  }, [props.jobsService]);

  console.log(info);

  var table = [["True", "This_job", "January", "This is the description", "Minnesota"],
          ["False", "Hehe", "January", "This Be the description", "Boston"],
          ["True", "Plumber", "January", "This the description", "Chicago "],
          ["True", "Weeee", "May", "yeet", "Colorado "],
          ["True", "yeet", "June", "Hello", "Maine "],
          ["True", "Actuary", "November", "Super normal weather", "Ba Sing Se"],
          ["False", "Hehe", "January", "This Be the description", "Boston"],
          ["False", "The Avatar", "January", "This the description", "Chicago "],
          ["True", "Airbender", "April", "well what do I say here", "Buffalo "],
          ["True", "Hello", "September", "meep", "Maryland "],
          ["True", "This_job", "January", "This is the description", "Minnesota"],
          ["False", "Hehe", "January", "This Be the description", "Boston"],
          ["True", "Plumber", "January", "This the description", "Chicago "],
          ["True", "Weeee", "May", "yeet", "Colorado "],
          ["True", "yeet", "June", "Hello", "Maine "],
          ["True", "Actuary", "November", "Super normal weather", "Ba Sing Se"],
          ["False", "Hehe", "January", "This Be the description", "Boston"],
          ["False", "The Avatar", "January", "This the description", "Chicago "],
          ["True", "Airbender", "April", "well what do I say here", "Buffalo "],
        ]

  const items = [];


  for (const [index, value] of table.entries()) {
        if(table[index][0] === "True"){
          items.push(

            <Grid item xs = {12} sm={6} md={6} lg={6} justify="flex-start">
              <Card className={classes.card} align="left">

                  <CardContent>
                      <Typography className={classes.job}> {table[index][1]}
                      </Typography>

                      <Typography className={classes.basicInfo}> {table[index][4]}
                      </Typography>

                      <Typography className={classes.basicInfo}> {table[index][2]}
                      </Typography>

                      <Button align='Left' className={classes.LearnMore} onClick={() => "/browse/jobs/this_job"}>
                          Learn more
                      </Button>

                  </CardContent>
                </Card>
              </Grid>

          )
      }
  }

  return (
      <Grid sm={12} md={12} lg={12} className={classes.root}
          container
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
        <Typography variant="h4" style={{margin: '3vh', fontFamily: Style.FontFamily}}>
            Find a job opportunity
        </Typography>

        <Grid xs = {9} sm={8} md={6} lg={6} container spacing = {3} justify="flex-start">
            <Button className={classes.Button}>
            Add Job
            </Button>
        </Grid>

        <Grid xs = {9} sm={8} md={6} lg={6} container spacing = {3} justify="flex-start">
            {items}
        </Grid>
      </Grid>

  );
}

export default JobPostings
