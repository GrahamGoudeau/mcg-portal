import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import React, {useEffect, useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

function AccountDetailsDemo(props) {
    const classes = useStyles();
    const bull = <span className={classes.bullet}>•</span>;
    const [info, setInfo] = useState({});
    const url = `${props.hostName}/api/account`

    useEffect(() => {
        async function fetchData() {
            return await props.serverClient.fetch(url, {
                method: 'GET'
            });
            }

        fetchData().then(res => res.json()).then(r => setInfo(r))},
        [])

    console.log(info)

    return <Grid container
                 justify="center"
                 alignItems="center"
                 direction="column"
                 spacing={0}
                 style={{
                     height: '90vh',
                 }}
            >
                <Card  className={classes.root}>
                    <CardContent >
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            User Name: {info.firstName} {info.lastName}
                        </Typography>
                        <Typography variant="h5" component="h2">
                            be{bull}nev{bull}o{bull}lent
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                            adjective
                        </Typography>
                        <Typography variant="body2" component="p">
                            well meaning and kindly.
                            <br />
                            {'"a benevolent smile"'}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
    </Grid>
}

export default AccountDetailsDemo


