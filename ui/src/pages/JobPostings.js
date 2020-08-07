import React, {useEffect, useState} from "react";
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../lib/Style'
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
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
      backgroundColor: Style.Orange,
      color: 'white',
      width: '30%',
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.Tan,
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
  const history = useHistory();
  const [info, setInfo] = useState([]);

  useEffect(() => {
      props.jobsService.getAllJobs().then(setInfo);
  }, [props.jobsService]);

  // TODO: filter(posting => !posting.pending).
  const items = info.map((posting, i) => <Grid key={i} item xs = {12} sm={6} md={6} lg={6} >
      <Card key={i} className={classes.card} align="left">
          <CardContent>
              <Typography className={classes.job}>
                  {posting.title}
              </Typography>
              <Typography className={classes.basicInfo}>
                  {posting.location}
              </Typography>

              <Typography noWrap className={classes.basicInfo}>
                  {posting.description}
              </Typography>

              <Button align='Left' className={classes.LearnMore} onClick={() => history.push("/browse/jobs/" + posting.id)}>
                  Learn more
              </Button>
          </CardContent>
      </Card>
  </Grid>)

  return (
      <Grid item sm={12} md={12} lg={12} className={classes.root}
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

        <Grid container item xs={9} sm={8} md={6} lg={6} spacing = {3} justify="flex-start">
            <Button className={classes.Button} onClick={() => history.push("/browse/jobs/new")}>
            Add Job
            </Button>
        </Grid>

        <Grid container item xs = {9} sm={8} md={6} lg={6} spacing = {3} justify="flex-start">
            {items}
        </Grid>
      </Grid>

  );

}

export default JobPostings
