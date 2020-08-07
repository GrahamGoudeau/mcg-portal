import {Paper} from "@material-ui/core";
import React from "react";
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import Style from "../../lib/Style";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    paper: {
        fontFamily: Style.FontFamily,
        backgroundColor: Style.Orange,
        fontSize: '16px',
        textAlign: 'center',
        textTransform: 'none',
        borderRadius: '5px',
        width: '95%',
    },
}));

function Badge(props) {
    const classes = useStyles();

    return <Paper className={classes.paper} style={{width: '100%', maxWidth: '100%'}}>
        <div>
            {props.badgeObj.name}
        </div>
        {props.allowEdits ?
            <div>
                <DeleteOutlinedIcon
                    fontSize="small"
                    style={{cursor: 'pointer'}}
                    onClick={() => props.onDelete(props.badgeObj.id)}
                />
        </div> : null}
    </Paper>
}

export default Badge;
