import React, {useEffect, useState} from 'react';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

const validEnrollmentStatuses = ['Current Student', 'Alum'];
const notApplicableOption = 'N/A';
const allOption = 'All';

// expects:
// onEvent: function(newValue string)
// className: css class name
// initialValue: on initial render, provide empty string
function EnrollmentStatusSelector(props) {
    const statusesToRender = [...validEnrollmentStatuses];
    if (props.allowStaffOption) {
        statusesToRender.unshift('Staff')
    }
    if (props.allowAllOption) {
        statusesToRender.unshift(allOption);
    }
    if (props.allowNotApplicableOption) {
        statusesToRender.push(notApplicableOption);
    }
    const [enrollmentStatus, setEnrollmentStatus] = useState(statusesToRender[0]);
    useEffect(() => {
        props.onChange(enrollmentStatus);
    }, [props.onChange, enrollmentStatus]);


    const menuItems = statusesToRender.map(status => <MenuItem value={status}>{status}</MenuItem>);

    return (
        <FormControl variant={props.formControlVariant} style={{width: '100%'}}>
            <InputLabel id="enrollment-status-label">Enrollment Status</InputLabel>
            <Select
                labelId="enrollment-status-label"
                value={enrollmentStatus}
                onChange={e => {
                    setEnrollmentStatus(e.target.value);
                    props.onChange(e.target.value);
                }}
                label="Enrollment Status"
                className={props.className}
            >
                {menuItems}
            </Select>
        </FormControl>
    )
}

export { EnrollmentStatusSelector, notApplicableOption, allOption };
