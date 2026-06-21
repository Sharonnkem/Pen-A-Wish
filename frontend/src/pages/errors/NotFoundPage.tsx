import { Link } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { PublicInfoLayout } from "@/components/layout/PublicInfoLayout";

export function NotFoundPage() {
  return (
    <PublicInfoLayout
      eyebrow="404"
      title="This page wandered off the celebration board"
      subtitle="The link may be outdated, mistyped, or no longer available. You can still jump back into the main Pen A Wish experience from here."
    >
      <div className="space-y-6 text-sm leading-7 text-charcoal-900/72">
        <p>
          Public celebration links, dashboard pages, or support pages should all remain easy to reach. If one disappeared, the simplest next step is to return home or head back to your dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/">
            <Button>Go home</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary">Open dashboard</Button>
          </Link>
        </div>
      </div>
    </PublicInfoLayout>
  );
}
