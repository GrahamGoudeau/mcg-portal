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


const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
    },
    boldText: {
        fontSize: "18px",
        fontWeight: "bold",
        lineHeight: "25px",
        marginBottom: '1vh',
        fontFamily: Style.FontFamily,
    },
    nonBoldText: {
        fontSize: "16px",
        fontWeight: "normal",
        lineHeight: "22px",
        marginBottom: '2vh',
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
      marginTop: '0vh',
      paddingTop: '2vh',
      paddingBottom: '2vh',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      fontFamily: Style.FontFamily,
    },
    rectangle: {
      backgroundColor: '#F7991B',
      width: '50%',
      borderRadius: '5px',
      fontSize: "16px",
      fontWeight: "normal",
      lineHeight: "32px",
      marginBottom: '2vh',
      whiteSpace: 'nowrap',
      fontFamily: Style.FontFamily,
    },
    title: {
        flexGrow: 1,
        fontFamily: Style.FontFamily,
    },
    bar: {
        background: Style.Blue,
    }
}));

function Account(props){
  const classes = useStyles();
  const history = useHistory();
  const [info, setinfo] = useState({});
  const url = `${props.hostName}/api/account`;

  useEffect(() => {
      async function fetchData() {
          return await props.serverClient.fetch(url, {
            method: 'GET'
          });
        }
      fetchData().then(r => r.json()).then(r => setinfo(r))},
      [])

  console.log(info)

  return (
      <Grid item sm={12} md={12} lg={12}
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
            <Grid item xs={9} sm={6} md={5} lg={4} style={{width: '100%'}}>
                <Typography style={{fontSize: "24px", lineHeight: "33px", marginBottom: '4vh', fontFamily: Style.FontFamily,}}>
                    Account Info
                </Typography>
                <Typography style={{fontSize: "24px", lineHeight: "48px"}}>   </Typography>

                <Typography className={classes.boldText} align="Left">Name</Typography>
                <Typography className={classes.nonBoldText} align="Left">{info.firstName} {info.lastName}</Typography>
                <Typography className={classes.boldText} align="Left" style={{fontWeight: "bold"}}>Email</Typography>
                <Typography className={classes.nonBoldText} align="Left">{info.email}</Typography>
                <Grid container
                  direction="row"
                  justify="flex-start"
                  alignItems="center"
                  >
                    <span className={classes.rectangle}>
                        {info.enrollmentStatus}
                    </span>
                </Grid>
                <Button className={classes.Button} style={{fontFamily: "Open Sans"}}>Change Password</Button>
            </Grid>
        </Grid>
  );


}

export default Account
