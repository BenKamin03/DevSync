import React from "react";
import { useLocationStore } from "../../stores/location";
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
}

const Link = ({ href, children, ...props }: LinkProps) => {
    return (
        <a
            {...props}
            onClick={() => {
                useLocationStore.getState().navigate(href);
            }}
        >
            {children}
        </a>
    );
};

export default Link;
