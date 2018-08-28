export const waitForRender = () => new Promise((resolve) => {
    // RAF executes before render
    requestAnimationFrame(() => {
        // A timeout of 0 executes in the next task, after render
        setTimeout(resolve);
    });
});
//# sourceMappingURL=async-utils.js.map