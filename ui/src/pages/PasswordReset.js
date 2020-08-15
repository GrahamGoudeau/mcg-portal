import React, {useState} from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { TextField } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

function PasswordResetPage(props) {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');

    async function nextStep() {
        if (step === 1) {
            const isValid = await props.passwordResetService.validateToken(email, token);
            if (!isValid) {
                alert("Token is not recognized. It might be expired, or you may have copy/pasted it incorrectly.")
                return
            }
        }

        setStep(step + 1);
    }

    let emailEntry = null;
    if (step >= 0) {
        emailEntry = <Grid container direction='row' style={{width: '100%'}}>
            <Grid item xs={1}>
                <Grid container alignItems='center' justify='center' style={{height: '100%'}}>
                    {step > 0 ? <CheckCircleIcon style={{color: 'green'}}/> : <ErrorOutlineIcon style={{color: 'orange'}}/>}
                </Grid>
            </Grid>
            <Grid item xs={11}>
                <TextField fullWidth variant='outlined' value={email} disabled={step > 0} onChange={e => setEmail(e.target.value)} label='Email'/>
            </Grid>
        </Grid>
    }

    let tokenEntry = null;
    if (step > 0) {
        tokenEntry = <Grid container direction='row' style={{width: '100%', marginTop: '3%'}}>
            <Grid item xs={1}>
                <Grid container alignItems='center' justify='center' style={{height: '100%'}}>
                    {step > 1 ? <CheckCircleIcon style={{color: 'green'}}/> : <ErrorOutlineIcon style={{color: 'orange'}}/>}
                </Grid>
            </Grid>
            <Grid item xs={11}>
                <TextField fullWidth variant='outlined' value={token} disabled={step > 1} onChange={e => setToken(e.target.value)} label='Reset Token'/>
            </Grid>
        </Grid>
    }

    let passwordEntry = null;
    if (step === 2) {
        passwordEntry = <p>Hi</p>
    }

    const nextButton = step < 2 ? <Button variant='contained' onClick={nextStep}>Next</Button> : <Button>Finish</Button>;
    const previousButton = <Button variant='contained' onClick={() => {
        if (step > 0) {
            setStep(step - 1);
        }
    }} disabled={step === 0}>Previous</Button>

    return <Grid container direction='column' justify='center' alignItems='center' alignContent='center'>
        <Grid item xs={12} md={6} style={{marginBottom: '3%'}}>
            <Stepper activeStep={step} alternativeLabel>
                <Step>
                    <StepLabel>Enter Your Email</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Copy/Paste Your Reset Token</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Choose Your New Password</StepLabel>
                </Step>
            </Stepper>
        </Grid>
        <Grid item xs={10} md={6} style={{textAlign: 'center', width: '100%'}}>
            {emailEntry}
        </Grid>
        <Grid item xs={10} md={6} style={{textAlign: 'center', width: '100%'}}>
            {tokenEntry}
        </Grid>
        <Grid item xs={10} md={6} style={{textAlign: 'center', width: '100%'}}>
            {passwordEntry}
        </Grid>
        <Grid item xs={10} md={6} style={{marginTop: '3%', marginBottom: '2%'}}>
            {nextButton}
        </Grid>
        <Grid item xs={10} md={6}>
            {previousButton}
        </Grid>
    </Grid>
}

export default PasswordResetPage;
