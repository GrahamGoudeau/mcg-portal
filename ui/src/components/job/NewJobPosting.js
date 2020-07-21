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
    buttonSubmit: {
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
    buttonBack: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Purple,
        color: 'white',
        width: '90%',
        maxWidth: '100%',
        marginTop: '36px',
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
        height: '12px',
    },
    loading: {
        fontSize: '12px',
        color: 'black',
        margin: 0,
        maxWidth: '90%',
        textAlign: 'center',
        display: 'inline-block',
        height: '12px',
    },
    submitted: {
        fontSize: '12px',
        color: 'green',
        margin: 0,
        maxWidth: '90%',
        textAlign: 'center',
        display: 'inline-block',
        height: '12px',
    }
}));

// required props: hostname, serverClient, 
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
                    variant="containedBack"
                    className={classes.buttonBack}
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
    const [requestStatus, setRequestStatus] = UseAsyncState({
        loading: false,
        submitted: false,
    });
    const [validationError, setValidationError] = UseAsyncState('');


    function dateToString(date) {
        return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
    }

    async function createJobPosting() {
        const url = `${props.hostname}/api/job-postings`;
        const time = dateToString(new Date());

        return props.serverClient.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                title: title,
                post_time: time,
                description: description,
                location: location,
            })
        }).then(r => {
            return r.ok;
        }).catch(e => {
            console.log("Unexpected error", e);
            return "Unexpected error"
        })
    }

    async function submitForm(e) {
        const time = dateToString(new Date());

        e.preventDefault();

        await setRequestStatus({
            loading: false,
            submitted: false,
        });

        var validationError = '';
        if (title === '' || description === '' || location === '') {
            validationError = 'All fields are required';
        }

        await setValidationError(validationError);

        if (validationError !== '') {
            return;
        }

        await setRequestStatus({
            ...requestStatus,
            loading: true,
        });
        try {
            const responseOk = await createJobPosting();
            if (!responseOk) {
                await setRequestStatus({
                    loading: false,
                    submitted: false,
                });
                return
            }
            await setRequestStatus({
                loading: false,
                submitted: true,
            });
        } catch (e) {
            await setRequestStatus({
                loading: false,
                submitted: false,
            })
        }
    }

    let requestStatusReport = <div className={classes.loading}></div>;
    if (requestStatus.loading) {
        requestStatusReport = <div className={classes.loading}>Creating a new job posting...</div>
    } else if (validationError !== '') {
        requestStatusReport = <div className={classes.errorMessage}>{validationError}</div>
    } else if (requestStatus.submitted) {
        requestStatusReport = <div className={classes.submitted}>You have submitted a job posting!</div>
    }

    return (
        <form className={classes.root} noValidate autoComplete="off" style={{textAlign: "center"}} onSubmit={e => submitForm(e)}>
            <TextField className={classes.textInput} id="title-field" label="Title" variant="outlined" onChange={e => {
                setTitle(e.target.value);
                setRequestStatus({
                    loading: false,
                    submitted: false,
                });
            }}/>
            <TextField className={classes.textInput} id="location-field" label="Location" variant="outlined" onChange={e => {
                setLocation(e.target.value);
                setRequestStatus({
                    loading: false,
                    submitted: false,
                });
            }}/>
            <TextField className={classes.textInput} id="description-field" label="Description" multiline rows={5} variant="outlined" onChange={e => {
                setDescription(e.target.value);
                setRequestStatus({
                    loading: false,
                    submitted: false,
                });
            }}/>
            <Button variant="contained" className={classes.buttonSubmit} type="submit" disabled={requestStatus.submitted}>Submit</Button>
            {requestStatusReport}
        </form>
    )
}

export default NewJobPosting
