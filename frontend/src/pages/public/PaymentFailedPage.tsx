import { Link, useSearchParams } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { PublicInfoLayout } from "@/components/layout/PublicInfoLayout";

export function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const eventSlug = searchParams.get("event") ?? "";
  const eventHref = eventSlug ? `/events/${eventSlug}` : "/";

  return (
    <PublicInfoLayout
      eyebrow="Payment Failed"
      title="That gift payment did not complete"
      subtitle="No wallet credit should happen for failed or unverified payments, so this page keeps the outcome clear and safe."
      actions={
        <Link to={eventHref}>
          <Button>Go back to celebration</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Card
          title="What this means"
          description="The payment did not finish successfully or could not be verified yet."
        >
          <div className="space-y-3 text-sm leading-7 text-charcoal-900/72">
            <p>The celebrant wallet should not be updated for failed or uncertain payment states.</p>
            <p>You can safely return to the celebration page and try again if you still want to send a gift.</p>
          </div>
        </Card>

        <Card
          tone="polaroid"
          title="Need help?"
          description="If money left your account but the page still showed a failure, contact support with your payment reference."
        >
          <div className="flex flex-wrap gap-3">
            <a href="mailto:support@penawish.com">
              <Button variant="secondary">Email support</Button>
            </a>
            <Link to="/contact">
              <Button variant="ghost">Open contact page</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PublicInfoLayout>
  );
}
