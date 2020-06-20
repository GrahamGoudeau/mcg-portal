function SetStateAsync(component, state) {
    return new Promise((resolve) => {
        component.setState(state, resolve)
    });
}

export default SetStateAsync;
