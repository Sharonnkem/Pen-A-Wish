import { Link } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { PublicInfoLayout } from "@/components/layout/PublicInfoLayout";

export function ServerErrorPage() {
  return (
    <PublicInfoLayout
      eyebrow="500"
      title="Something interrupted the celebration flow"
      subtitle="This looks like an application error rather than a missing page. You can refresh, return home, or head back to your dashboard."
    >
      <div className="space-y-6 text-sm leading-7 text-charcoal-900/72">
        <p>
          Pen A Wish should keep loading, empty, and error states graceful. If you reached this page, something failed more deeply than an ordinary validation or network message.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Link to="/">
            <Button variant="secondary">Go home</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost">Open dashboard</Button>
          </Link>
        </div>
      </div>
    </PublicInfoLayout>
  );
}
