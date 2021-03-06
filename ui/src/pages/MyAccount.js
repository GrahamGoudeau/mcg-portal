import React, {useEffect, useState} from "react";
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Style from '../lib/Style'
import {Button, Grid, TextField} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Name from "../lib/Name";
import BadgeGrid from '../components/connection/BadgeGrid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete from '@material-ui/lab/Autocomplete';
import AccountInfoGrid from "../components/account/AccountInfoGrid";

const resourceSuggestions = [
        {title: 'Panel Speaker'},
        {title: 'Resume Review'},
        {title: 'Mock Interview'},
        {title: 'Job Shadow'},
        {title: 'Career Advising'},
        {title: 'Education Advising'},
        {title: 'Job (Full Time)'},
        {title: 'Job (Intern)'},
        {title: 'Temporary Housing'},
        {title: 'Project Funding'},
        {title: 'Project Partner'},
  ]

const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: Style.FontFamily,
    },
    button: {
      fontFamily: Style.FontFamily,
      backgroundColor: Style.Purple,
      color: 'white',
      minWidth: '25%',
      maxWidth: '100%',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      '&:hover': {
          backgroundColor: Style.NavyBlue,
      },
      textTransform: 'none',
      whiteSpace: 'nowrap',
        marginBottom: '2%',
    },
    modal: {
        position: 'absolute',
        width: '50%',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        top: '25%',
        left: '0%',
    },
}));

function MyAccount(props){
    const classes = useStyles();
    var [info, setinfo] = useState({});
    const [userResourceNames, setUserResourceNames] = useState([]);
    const [badgeUpdateVersion, setBadgeUpdateVersion] = useState(0);
    const [newResourceModalOpen, setNewResourceModalOpen] = useState(false);
    const [newResourceName, setNewResourceName] = useState('');


    const handleOpen = () => {
        setNewResourceModalOpen(true);
    };

    const handleClose = () => {
        setNewResourceModalOpen(false);
        setNewResourceName('');
    };

    function submitNewResource(e) {
        e.preventDefault();
        if (newResourceName !== '') {
            props.resourcesService.createResource(info.id, newResourceName);
            handleClose();
            setBadgeUpdateVersion(badgeUpdateVersion + 1);
        }
    }

    function removeBadge(badgeId) {
        props.resourcesService.deleteResource(info.id, badgeId);
        setBadgeUpdateVersion(badgeUpdateVersion + 1);
    }

    console.log("Rendering account");
    useEffect(() => {
        console.log("effecting");
      props.accountsService.getMyAccount().then(accountData => {
          setinfo(accountData);
          props.resourcesService.getResourcesForUser(accountData.id)
              .then(resources => resources.map(r => ({name: r.name, id: r.id})))
              .then(setUserResourceNames);
      })
    }, [props.accountsService, props.resourcesService, badgeUpdateVersion]);

    return (
        <React.Fragment>
            <Dialog open={newResourceModalOpen} onClose={handleClose}>
                <DialogTitle>Create a new resource</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{marginBottom: '3%'}}>
                        Offer a new resource to the MCG community. This can be mentoring, networking, resume critiques, etc.
                        Those who are interested in the resource you're offering will be connected to you via MCG staff.
                    </DialogContentText>

                    <Autocomplete
                      id="free-solo-demo"
                      freeSolo
                      options={resourceSuggestions.map((option) => option.title)}
                      onChange={(_, value) => setNewResourceName(value)}
                      renderInput={(params) => (
                      <TextField {...params} clearOnEscape fullWidth label="Description" margin="normal" variant="outlined" value={newResourceName} onChange={e => setNewResourceName(e.target.value)}/>
                    )}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={submitNewResource} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Typography variant="h4" style={{fontFamily: Style.FontFamily, textAlign: 'center', margin: '3%'}}>Your Profile</Typography>
            <Grid
                container
                direction="column"
                alignContent="center"
                alignItems="center"
                justify="flex-start"
            >
                <Grid item xs={10} sm={9} md={6} lg={6}
                      alignItems="center"
                      direction="column"
                      style={{width: '100%', display: 'flex', fontFamily: Style.FontFamily}}
                >
                    {info === {} ? null : <AccountInfoGrid editable account={{
                        ...info,
                        name: Name(info),
                    }}/>}

                    <Paper elevation={5} style={{width: '100%', marginBottom: '3vh'}}>
                        <div style={{padding: '2%'}}>
                            <Typography variant="h5" className={classes.subHeader}>
                                Resources You're Offering
                            </Typography>
                            <Button variant="contained" className={classes.button} onClick={handleOpen}>Offer a new resource</Button>
                            <hr style={{display: userResourceNames.length > 0 ? 'block' : 'none'}}/>
                            <BadgeGrid
                                badges={userResourceNames}
                                allowEdits={true}
                                userId={info.id}
                                resourcesService={props.resourcesService}
                                onBadgeDelete={removeBadge}
                            />
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default MyAccount
