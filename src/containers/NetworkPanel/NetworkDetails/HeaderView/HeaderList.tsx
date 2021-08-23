import React from "react";
import { Header } from "../../../../hooks/useNetworkMonitor";

interface IHeadersProps {
  headers: Header[];
}

export const HeaderList = (props: IHeadersProps) => {
  const { headers } = props;
  return (
    <ul className="list-none m-0">
      {headers.map((header) => (
        <li
          key={`${header.name}:${header.value}`}
          className="dark:text-gray-300 pl-4 py-0.5"
        >
          <span className="font-bold">{header.name}: </span>
          {header.value}
        </li>
      ))}
    </ul>
  );
};
