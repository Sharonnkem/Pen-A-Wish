import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { PublicInfoLayout } from "@/components/layout/PublicInfoLayout";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";
  const eventSlug = searchParams.get("event") ?? "";
  const eventHref = useMemo(
    () => (eventSlug ? `/events/${eventSlug}` : "/"),
    [eventSlug]
  );

  return (
    <PublicInfoLayout
      eyebrow="Payment Success"
      title="Your gift payment was received successfully"
      subtitle="The celebration can continue with confidence. Verified gift records are handled server-side before any wallet credit is made."
      actions={
        <Link to={eventHref}>
          <Button>Return to celebration</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Card
          tone="polaroid"
          title="Verified on the backend"
          description="Pen A Wish only records a successful gift after the payment reference and amount are confirmed safely on the server."
        >
          <div className="rounded-[22px] bg-cream-50 p-5 text-sm leading-7 text-charcoal-900/72">
            <p className="font-semibold text-charcoal-900">Reference</p>
            <p className="mt-2 break-all">{reference || "Reference will appear here when provided."}</p>
          </div>
        </Card>

        <Card
          title="What happens next"
          description="The celebrant can now see the gift as part of the wider celebration story once verification is complete."
        >
          <div className="grid gap-3 text-sm leading-7 text-charcoal-900/72">
            <p>Your payment record is matched against the expected server-side amount.</p>
            <p>The gift is stored and the celebrant wallet is updated only once.</p>
            <p>Notification flows can continue without exposing sensitive payment secrets.</p>
          </div>
        </Card>
      </div>
    </PublicInfoLayout>
  );
}
