import React, {useEffect, useState} from 'react';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

const validEnrollmentTypes = ['Current Student', 'Alum'];
const notApplicableOption = 'N/A';
const allOption = 'All';

// expects:
// onEvent: function(newValue string)
// className: css class name
// initialValue: on initial render, provide empty string
function EnrollmentTypeSelector(props) {
    const statusesToRender = [...validEnrollmentTypes];
    if (props.allowStaffOption) {
        statusesToRender.unshift('Staff')
    }
    if (props.allowAllOption) {
        statusesToRender.unshift(allOption);
    }
    if (props.allowNotApplicableOption) {
        statusesToRender.push(notApplicableOption);
    }
    const [enrollmentType, setEnrollmentType] = useState(statusesToRender[0]);
    useEffect(() => {
        props.onChange(enrollmentType);
    }, [props.onChange, enrollmentType]);


    const menuItems = statusesToRender.map(status => <MenuItem value={status}>{status}</MenuItem>);

    return (
        <FormControl variant={props.formControlVariant} style={{width: '100%'}}>
            <InputLabel id="enrollment-status-label">Enrollment Type</InputLabel>
            <Select
                labelId="enrollment-status-label"
                value={enrollmentType}
                onChange={e => {
                    setEnrollmentType(e.target.value);
                    props.onChange(e.target.value);
                }}
                label="Enrollment Type"
                className={props.className}
            >
                {menuItems}
            </Select>
        </FormControl>
    )
}

export { EnrollmentTypeSelector, notApplicableOption, allOption };
