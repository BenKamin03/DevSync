import * as React from "react";
import "./styles.css";
import { BrowserRouter as Router, Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import { importAll } from "../utilities/general";
export interface IAppProps {}

interface PageMap {
    [key: string]: React.FC;
}

export const App: React.FunctionComponent<IAppProps> = ({}: React.PropsWithChildren<IAppProps>) => {
    const pages: PageMap = importAll(require.context("./pages", true, /\.tsx$/));

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    {Object.entries(pages).map(([key, Value]) => (
                        <Route key={key} path={`/${key.replace("page", "").replace(/\[.*?\]/g, (match) => `:${match.slice(1, -1)}`)}`} element={<Value />} />
                    ))}
                </Route>
                <Route path="*" element={<Navigate to={"/"} />} />
            </Routes>
        </BrowserRouter>
    );
};
