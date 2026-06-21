import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { ServerErrorPage } from "@/pages/errors/ServerErrorPage";

export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return <ServerErrorPage />;
}
