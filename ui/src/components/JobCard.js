import React, {useEffect, useState} from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import LinesEllipsis from "react-lines-ellipsis";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Style from "../lib/Style";
import moment from "moment";

function JobCard(props) {
    const [modalOpen, setModalOpen] = useState(false);

    const {
        posting,
        classes,
    } = props;
    return <Card className={classes.card} align="left">
        <Dialog open={modalOpen}>
            <DialogTitle disableTypography style={{fontWeight: 'bold', fontSize: '1.5em'}}>{posting.details.title}</DialogTitle>
            <DialogContent>
                <DialogContentText style={{fontFamily: Style.FontFamily, fontWeight: 'bold'}}>
                    {moment(posting.details.postedAt).format("dddd, MMMM Do YYYY")}
                </DialogContentText>
                <DialogContentText>
                    <span style={{fontFamily: Style.FontFamily, fontWeight: 'bold'}}>Location:</span> {posting.details.location}
                </DialogContentText>
                <DialogContentText>
                    <span style={{fontFamily: Style.FontFamily, fontWeight: 'bold'}}>Posted By:</span> {posting.poster.posterFirstName} {posting.poster.posterLastInitial}
                </DialogContentText>
                <DialogContentText style={{fontFamily: Style.FontFamily, whiteSpace: 'pre-line'}}>
                    {posting.details.description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button className={classes.button} onClick={() => setModalOpen(false)}>Dismiss</Button>
            </DialogActions>
        </Dialog>
        <CardContent>
            <Typography className={classes.job}>
                {posting.details.title}
            </Typography>
            <Typography className={classes.basicInfo}>
                {posting.details.location}
            </Typography>
            <LinesEllipsis
                text={posting.details.description}
                maxLine='3'
                ellipsis='...'
                trimRight
                basedOn='letters'
            />

            <Button align='Left' className={classes.LearnMore} onClick={() => setModalOpen(true)}>
                Learn more
            </Button>
        </CardContent>
    </Card>
}

export default JobCard;
