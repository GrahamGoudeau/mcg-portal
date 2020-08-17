import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import React, {useState} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Style from "../../lib/Style";
import HTMLEllipsis from 'react-lines-ellipsis/lib/html'
import moment from 'moment'
import Button from "@material-ui/core/Button";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles({
    title: {
        fontFamily: Style.FontFamily,
        fontSize: '24px',
        lineHeight: '33px'
    },
    pos: {
        marginBottom: 12,
    },
    button: {
        color: Style.Purple,
        fontSize: "16px",
    },
    card: {
        border: '1px solid #CFCFCF',
        boxSizing: 'border-box',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        width: '100%',
    },
    basicInfo: {
        fontFamily: Style.FontFamily,
        fontSize: '16px',
        lineHeight: '22px',
        paddingTop: '2vh'
    },
    LearnMore: {
        fontFamily: Style.FontFamily,
        color: Style.Purple,
        textAlign: 'left',
        padding: '0',
        margin: '0',
        fontWeight: '600'
    },
});

function EventCard(props) {
    const classes = useStyles();
    const obj = props.obj;
    const [modalOpen, setModalOpen] = useState(false);

    return <Card className={classes.card} align={"left"} elevation={8}>
        <CardContent>
            <Typography className={classes.title} gutterBottom>
                {obj.name}
            </Typography>
            <Typography variant="body2" className={classes.basicInfo} style={{fontFamily: Style.FontFamily}}
                        gutterBottom>{moment(obj.time).format("dddd, MMMM Do YYYY, h:mm a")}
            </Typography>
            <HTMLEllipsis
                className={classes.basicInfo}
                unsafeHTML={obj.description}
                maxLine={2}
                basedOn='letters'
                ellipsis='...'
            />
        </CardContent>
        <Button className={classes.button} onClick={() => setModalOpen(true)}>Learn More</Button>
        <Dialog open={modalOpen}>
            <DialogTitle disableTypography style={{fontWeight: 'bold', fontSize: '1.5em'}}>{obj.name}</DialogTitle>
            <DialogContent>
                <DialogContentText style={{fontFamily: Style.FontFamily, fontWeight: 'bold'}}>
                    {moment(obj.time).format("dddd, MMMM Do YYYY, h:mm a")}
                </DialogContentText>
                <DialogContentText style={{fontFamily: Style.FontFamily}}>
                    {obj.description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button className={classes.button} onClick={() => setModalOpen(false)}>Dismiss</Button>
            </DialogActions>
        </Dialog>
    </Card>
}

export default EventCard


