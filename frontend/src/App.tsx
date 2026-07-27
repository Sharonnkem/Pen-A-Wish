import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./routes";
import { LoadingState } from "./components/common/LoadingState";

export default function App() {
  return (
    <Suspense fallback={<LoadingState className="mx-auto my-8 max-w-4xl" />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
