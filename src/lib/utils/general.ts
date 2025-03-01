const importAll = (r: __WebpackModuleApi.RequireContext) => {
    const controllers: any = {};
    r.keys().forEach((key: string) => {
        const controllerName = key.replace("./", "").replace(".tsx", "").replace(".ts", "");
        const controllerModule = r(key).default;

        if (controllerName === "Home") {
            controllers[""] = controllerModule;
        } else {
            controllers[controllerName] = controllerModule;
        }
    });
    return controllers;
};

export { importAll };
