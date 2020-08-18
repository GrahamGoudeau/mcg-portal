import React from 'react';
import {Button, Grid} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";
import {useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {useHistory} from "react-router-dom";
import BasicInfoField from "./BasicInfoField";

const useStyles = makeStyles(() => ({
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

    return <div style={{padding: '2%'}}>
        <Grid
            container
            direction={isSmallScreen ? 'column' : 'row'}
        >
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                <BasicInfoField title="Email" value={account.email}/>
            </Grid>
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                <BasicInfoField title="Name" value={account.name}/>
            </Grid>
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%', whiteSpace: 'pre-line'}}>
                <BasicInfoField title="Bio" value={account.bio}/>
            </Grid>
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                <BasicInfoField title="Current Role" value={account.currentRole}/>
            </Grid>
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                <BasicInfoField title="Current School" value={account.currentSchool}/>
            </Grid>
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                <BasicInfoField title="Current Company" value={account.currentCompany}/>
            </Grid>
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                <BasicInfoField title="MCG Enrollment"
                                value={account.enrollmentType ? account.enrollmentType : 'Not enrolled'}/>
            </Grid>
            <Grid item xs={12} md={6} style={{textAlign: fieldTextAlign, marginBottom: '5%'}}>
                {props.editable ?
                    <Button className={classes.button} onClick={() => history.push('/browse/me/changeInfo')}>Edit
                        Account</Button> : null}
            </Grid>
        </Grid>
    </div>
}


export default AccountInfoGrid;
