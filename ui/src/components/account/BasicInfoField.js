import React, {useEffect, useState} from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
    subHeader: {
        fontFamily: Style.FontFamily,
        fontWeight: 'bold',
    },
}));

function BasicInfoField(props) {
    const classes = useStyles();

    return <React.Fragment>
        <Typography variant="h6" className={classes.subHeader}>{props.title}:</Typography>
        {props.value}
    </React.Fragment>
}

export default BasicInfoField;
