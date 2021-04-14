import React from "react";
import classes from "./Header.module.css";
import { Header } from "../../hooks/useNetworkMonitor";

interface IHeadersProps {
  headers: Header[];
}

export const Headers = (props: IHeadersProps) => {
  const { headers } = props;
  return (
    <ul className={classes.list}>
      {headers.map((header) => (
        <li className={classes.item}>
          <span>{header.name}: </span>
          {header.value}
        </li>
      ))}
    </ul>
  );
};
