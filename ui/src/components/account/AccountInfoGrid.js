import React, {useEffect, useState} from 'react';
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import {Button, Grid} from "@material-ui/core";
import Name from "../../lib/Name";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";
import {useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {useHistory} from "react-router-dom";

const useStyles = makeStyles(theme => ({
    subHeader: {
        fontFamily: Style.FontFamily,
        fontWeight: 'bold',
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
}));

function AccountInfoGrid(props) {
    const classes = useStyles();
    const {
        account
    } = props;
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const fieldTextAlign = isSmallScreen ? 'center' : 'left';
    const history = useHistory();

    return <Paper elevation={5} style={{width: '100%', marginBottom: '3%'}}>
        <div style={{padding: '2%'}}>
            <Typography variant="h5" className={classes.subHeader}>
                General
                <Tooltip title='Contact an MCG admin to change these values'>
                    <HelpOutlineIcon fontSize='small'/>
                </Tooltip>
            </Typography>
            <hr/>
            <Grid
                container
                direction={isSmallScreen ? 'column' : 'row'}
            >
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Typography variant="h6" className={classes.subHeader}>Email:</Typography>
                    {account.email}
                </Grid>
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Typography variant="h6" className={classes.subHeader}>Name:</Typography>
                    {Name(account)}
                </Grid>
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Typography variant="h6" className={classes.subHeader}>Bio:</Typography>
                    {account.bio}
                </Grid>
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Typography variant="h6" className={classes.subHeader}>Current Roll:</Typography>
                    {account.currentRole}
                </Grid>
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Typography variant="h6" className={classes.subHeader}>Current School:</Typography>
                    {account.currentSchool}
                </Grid>
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Typography variant="h6" className={classes.subHeader}>Current Company:</Typography>
                    {account.currentCompany}
                </Grid>
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Typography variant="h6" className={classes.subHeader}>Enrollment:</Typography>
                    <span style={{lineHeight: '10%'}}>
                                        {account.enrollmentType ? account.enrollmentType : 'Not enrolled'}
                                    </span>
                </Grid>
                <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                    <Button className={classes.button} onClick={ () => history.push('/browse/me/changeInfo')}>Edit Account</Button>
                </Grid>
            </Grid>
        </div>
    </Paper>
}


export default AccountInfoGrid;
