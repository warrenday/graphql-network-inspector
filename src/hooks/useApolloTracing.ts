import { useMemo } from "react";
import * as safeJson from "@/helpers/safeJson";
import { IResponseBody } from "@/types";

export const useApolloTracing = (responseBody: string = "") => {
  const tracing = useMemo(() => {
    const parsedResponse = safeJson.parse<IResponseBody>(responseBody) || {};
    const tracing = parsedResponse?.extensions?.tracing;
    return tracing;
  }, [responseBody]);

  return tracing;
};
