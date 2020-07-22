import React, {useState} from 'react';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

const validEnrollmentStatuses = ['Current Student', 'Alum', 'N/A'];

// expects:
// onEvent: function(newValue string)
// className: css class name
// initialValue: on initial render, provide empty string
function EnrollmentStatusSelector(props) {
    const [enrollmentStatus, setEnrollmentStatus] = useState(validEnrollmentStatuses[0]);

    if (props.initialValue === '') {
        props.onEvent(enrollmentStatus);
    }

    const menuItems = validEnrollmentStatuses.map(status => <MenuItem value={status}>{status}</MenuItem>)

    return (
        <FormControl variant="outlined" style={{width: '100%'}}>
            <InputLabel id="enrollment-status-label">MCG Enrollment Status</InputLabel>
            <Select
                labelId="enrollment-status-label"
                value={enrollmentStatus}
                onChange={e => {
                    setEnrollmentStatus(e.target.value);

                    var value = e.target.value;
                    if (value === 'N/A') {
                        value = null;
                    }
                    props.onEvent(value);
                }}
                label="MCG Enrollment Status"
                className={props.className}
            >
                {menuItems}
            </Select>
        </FormControl>
    )
}

export default EnrollmentStatusSelector;
