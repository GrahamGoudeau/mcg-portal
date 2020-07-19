import React, {useState} from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from "react-router-dom";
import Button from '@material-ui/core/Button';
import UseAsyncState from "../../lib/Async";
import Style from "../../lib/Style";
import { Grid } from '@material-ui/core';

const hostname = process.env.REACT_APP_HOSTNAME ? process.env.REACT_APP_HOSTNAME : window.location.host;
const hostnameWithProtocol = `http://${hostname}`;

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '90%',
            maxWidth: '100%',
            fontFamily: Style.FontFamily,
        },
    },
    button: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        color: 'white',
        width: '90%',
        maxWidth: '100%',
        marginTop: '48px',
        '&:hover': {
            backgroundColor: Style.NavyBlue,
        }
    },
    textInput: {
        marginTop: '16px',
        '& > *': {
            background: 'white',
        },
    },
    errorMessage: {
        fontSize: '12px',
        color: 'red',
        margin: 0,
        maxWidth: '90%',
        textAlign: 'center',
        display: 'inline-block',
        height: '3vh',
    },
    loading: {
        fontSize: '12px',
        color: 'black',
        margin: 0,
        maxWidth: '90%',
        textAlign: 'center',
        display: 'inline-block',
        height: '3vh',
    }
}));

function NewJobPosting(props) {
    const history = useHistory();
    const classes = useStyles();

    return (
        <Grid
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
                fontSize: '24px',
                background: Style.White,
                color: Style.NavyBlue,
            }}
        >
            <Grid item sm={5} md={5} lg={3}>
                <p>Add a new job posting to share</p>
                <JobPostingForm serverClient={props.serverClient}/>
                <Button
                    variant="contained"
                    className={classes.button}
                    onClick={() => history.replace('/browse/jobs')}>
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}


function JobPostingForm(props) {
    const classes = useStyles();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [hasEmptyField, setHasEmptyField] = useState(false);
    const [submissionState, setSubmissionState] = UseAsyncState({
        lastAttemptFailed: false,
        error: null,
        loading: false,
    });

    function dateToString(date) {
        return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
    }

    async function submitJobPosting() {
        const url = `${hostnameWithProtocol}/api/job-postings`;
        const time = dateToString(new Date());

        return await props.serverClient.fetch(url, {
            method: "POST",
            body: JSON.stringify({
                title: title,
                post_time: time,
                description: description,
                location: location,
            })
        }).then(r => {
            return r.json();
        }).catch(e => {
            console.log("Unexpected error", e);
            return "Unexpected"
        })
    }

    // TO DO: functions to validate input!!
    // TO DO: functions to render error messages when input is not valid
    return (
        <form className={classes.root} noValidate autoComplete="off" style={{textAlign: "center"}}>
            <TextField className={classes.textInput} id="title-field" label="Title" variant="outlined" onChange={e => {
                setTitle(e.target.value);
            }}/>
            <TextField className={classes.textInput} id="location-field" label="Location" variant="outlined" onChange={e => {
                setLocation(e.target.value)
            }}/>
            <TextField className={classes.textInput} id="description-field" label="Description" multiline rows={5} variant="outlined" onChange={e => {
                setDescription(e.target.value)
            }}/>
            <Button variant="contained" className={classes.button} type="submit" onClick={() => {
                console.log("submitting a new job posting");
                submitJobPosting();
            }}>Submit</Button>
        </form>
    )
}

export default NewJobPosting
