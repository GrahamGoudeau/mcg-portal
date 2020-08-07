import React, {useState, useEffect} from 'react';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Style from '../../lib/Style'

const validOptions = [
    'Panel Speaker',
    'Resume Review',
    'Mock Interview',
    'Job Shadow',
    'Career Advising',
    'Education Advising',
    'Full-Time Job',
    'Internship',
    'Temporary Housing',
    'Project Funding',
    'Project Partner',
];

const allOption = 'All';

const otherOption = 'Other';

function ResourceSelector(props) {
    const opts = [...validOptions];
    if (props.allowAllOption) {
        opts.unshift(allOption);
    }
    if (props.allowOtherOption) {
        opts.unshift(otherOption);
    }
    const selectItems = opts.map(opt => <MenuItem value={opt}>{opt}</MenuItem>);

    const [selection, setSelection] = useState(opts[0]);
    const { onChange } = props;
    useEffect(() => {
        onChange(selection);
    }, [onChange, selection]);

    return (
        <FormControl variant={props.formVariant} style={{width: '100%'}}>
            <InputLabel id="resource-type-label" style={{fontFamily: Style.FontFamily}}>Resource Type</InputLabel>
            <Select
                labelId="resource-type-label"
                value={selection}
                onChange={e => setSelection(e.target.value)}
                label="Resource Name"
                style={{fontFamily: Style.FontFamily}}
            >
                {selectItems}
            </Select>
        </FormControl>
    )
}

export default { Component: ResourceSelector, AllOption: allOption};
