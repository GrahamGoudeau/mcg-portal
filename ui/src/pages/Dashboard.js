import React, {useEffect, useState} from 'react';
import {Grid} from "@material-ui/core";
import PendingRequest from "../components/dashboard/PendingRequest";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AppBar from '@material-ui/core/AppBar';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

function Dashboard(props) {
    const classes = useStyles();

    const [list, setList] = useState([]);
    const [dataVersion, setDataVersion] = useState(0); // number of times we've updated the data. Increment to refresh the data
    const [value, setValue] = React.useState(0);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    async function resolveRequest(requestId) {
        /*eslint no-restricted-globals: [0]*/
        if (confirm("Are you sure you'd like to resolve this connection request?")) {
            await props.connectionsService.resolveConnectionRequest(requestId);
            setDataVersion(dataVersion + 1);
        }
    }

    useEffect(() => {
        // props.connectionsService
        //     .getAllConnectionRequests()
        //     .then(result => result.filter(request => !request.resolved))
        //     .then(setList);
        setList([])
    }, [dataVersion, props.connectionsService]);

    const requests = list.map(pendingRequest =>
        <PendingRequest
            request={pendingRequest}
            onResolve={resolveRequest}
        />
    );

    return (
        <div className={classes.root}>
            {/*<AppBar position="static" style={{backgroundColor: 'white', color: 'black'}}>*/}
            {/*    <Tabs*/}
            {/*        variant={isSmallScreen ? "fullWidth" : null}*/}
            {/*        value={value}*/}
            {/*        onChange={handleChange}*/}
            {/*        aria-label="nav tabs example"*/}
            {/*        centered={!isSmallScreen}*/}
            {/*    >*/}
            {/*        <Tab label={`Pending Approvals (${requests.length})`} {...a11yProps(0)}/>*/}
            {/*        <Tab label="Pending Jobs" {...a11yProps(1)}/>*/}
            {/*    </Tabs>*/}
            {/*</AppBar>*/}
            {/*<TabPanel value={value} index={0}>*/}
            {/*    <div style={{padding: '0%', textAlign: 'center'}}>*/}
            {/*        <Grid container alignItems='center' alignContent='center' direction='column'>*/}
            {/*            {requests.length > 0 ? requests.map(request => <Grid item xs={12} lg={3}>*/}
            {/*                {request}*/}
            {/*            </Grid>) : <h4>All requests have been resolved!</h4>}*/}
            {/*        </Grid>*/}
            {/*    </div>*/}
            {/*</TabPanel>*/}
            {/*<TabPanel value={value} index={1}>*/}
            {/*    Pending Job Postings*/}
            {/*</TabPanel>*/}
        </div>
    )
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default Dashboard;
