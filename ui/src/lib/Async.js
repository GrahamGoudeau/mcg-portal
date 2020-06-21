import {useState} from 'react';

function SetStateAsync(component, state) {
    return new Promise((resolve) => {
        component.setState(state, resolve)
    });
}

function UseAsyncState(initialValue) {
    const [value, setValue] = useState(initialValue);
    const setter = x =>
        new Promise(resolve => {
            setValue(x);
            resolve(x);
        });
    return [value, setter];
}

export default UseAsyncState;
