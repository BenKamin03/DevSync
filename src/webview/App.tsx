import * as React from "react";
import "./styles.css";
import { importAll } from "../lib/utils/general";
import { useLocationStore } from "./stores/location";
import { useEffect } from "react";

export interface IAppProps {}

interface PageMap {
    [key: string]: React.FC;
}

interface RouteParams {
    [key: string]: string;
}

function matchRoute(pathname: string, pattern: string): RouteParams | null {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);

    if (patternParts.length !== pathParts.length) {
        return null;
    }

    const params: RouteParams = {};

    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(":")) {
            const paramName = patternParts[i].slice(1);
            params[paramName] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }

    return params;
}

export const App: React.FunctionComponent<IAppProps> = ({}: React.PropsWithChildren<IAppProps>) => {
    const pages: PageMap = importAll(require.context("./pages", true, /\.tsx$/));
    const currentLocation = useLocationStore().currentLocation;

    const routes = Object.entries(pages).map(([key, Component]) => ({
        pattern: `/${key
            .replace("page", "")
            .replace(/\[(.+?)\]/g, ":$1")
            .replace(/\/+$/, "")}`,
        Component,
    }));

    const matchingRoute = routes.find((route) => matchRoute(currentLocation, route.pattern));

    const Render = matchingRoute ? matchingRoute.Component : pages["page"];

    const params = matchingRoute ? matchRoute(currentLocation, matchingRoute.pattern) : {};

    return (
        <div className="h-screen w-full border-t border-[--vscode-activityBar-dropBorder]">
            <Render {...params} />
        </div>
    );
};
