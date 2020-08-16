import React, {useState} from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { TextField } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import getContactEmail from "../lib/Contact";
import {useHistory} from "react-router-dom";

function PasswordResetPage(props) {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const history = useHistory();

    async function nextStep() {
        if (step === 0) {
            await props.passwordResetService.sendResetEmail(email);
        } else if (step === 1) {
            const isValid = await props.passwordResetService.validateToken(email, token);
            if (!isValid) {
                alert("Token is not recognized. It might be expired, or you may have copy/pasted it incorrectly. Alternatively, check to make sure there are no typos in your email address");
                return
            }
            setPassword('');
            setConfirmedPassword('');
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
            <Grid item xs={12}>
                <p style={{fontSize: '0.9em'}}>
                    If this email address belongs to a known account here, you'll receive an email with a long alphanumeric code. Paste this code in the box below.
                    Contact {getContactEmail()} for assistance.
                </p>
            </Grid>
            <Grid item xs={1}>
                <Grid container alignItems='center' justify='center' style={{height: '100%'}}>
                    {step > 1 ? <CheckCircleIcon style={{color: 'green'}}/> : <ErrorOutlineIcon style={{color: 'orange'}}/>}
                </Grid>
            </Grid>
            <Grid item xs={11}>
                <TextField fullWidth variant='outlined' value={token} disabled={step > 1} onChange={e => setToken(e.target.value.trim())} label='Reset Token'/>
            </Grid>
        </Grid>
    }

    let passwordEntry = null;
    if (step === 2) {
        passwordEntry = <Grid container irection='row' style={{width: '100%', marginTop: '3%'}}>
            <Grid item xs={1}>
                <Grid container alignItems='center' justify='center' style={{height: '100%'}}>
                    {password !== '' ? <CheckCircleIcon style={{color: 'green'}}/> : <ErrorOutlineIcon style={{color: 'orange'}}/>}
                </Grid>
            </Grid>
            <Grid item xs={11}>
                <TextField type='password' fullWidth variant='outlined' value={password} onChange={e => setPassword(e.target.value)} label='New Password'/>
            </Grid>
            <Grid item xs={1}style={{marginTop: '3%'}}>
                <Grid container alignItems='center' justify='center' style={{height: '100%'}}>
                    {password !== '' && confirmedPassword === password ? <CheckCircleIcon style={{color: 'green'}}/> : <ErrorOutlineIcon style={{color: 'orange'}}/>}
                </Grid>
            </Grid>
            <Grid item xs={11}style={{marginTop: '3%'}}>
                <TextField type='password' fullWidth variant='outlined' value={confirmedPassword} onChange={e => setConfirmedPassword(e.target.value)} label='Confirm Password'/>
            </Grid>
        </Grid>
    }

    const nextButton = step < 2 ? <Button variant='contained' onClick={nextStep}>Next</Button>
        : <Button disabled={password === '' || password !== confirmedPassword} variant='contained' onClick={submitForm}>Finish</Button>;
    const previousButton = <Button variant='contained' onClick={() => {
        if (step > 0) {
            setStep(step - 1);
        }
    }} disabled={step === 0}>Previous</Button>;

    async function submitForm() {
        await props.passwordResetService.useResetToken(token, confirmedPassword)
        alert('Password reset successfully! You may now log in with your new password.')
        history.push('/')
    }

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
