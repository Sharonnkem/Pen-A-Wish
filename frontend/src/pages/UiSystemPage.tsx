import { Link } from "react-router-dom";

import { Button } from "../components/common/Button";
import { PublicInfoLayout } from "../components/layout/PublicInfoLayout";

export function UiSystemPage() {
  return (
    <PublicInfoLayout
      eyebrow="Warm guidance"
      title="Help that feels like part of the celebration"
      subtitle="A calm space for privacy, terms, contact details, and a few helpful pointers while you move through the Pen A Wish experience."
      actions={
        <>
          <Link to="/contact">
            <Button variant="secondary">Contact</Button>
          </Link>
          <Link to="/register">
            <Button>Create your page</Button>
          </Link>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-white/70 bg-white/84 p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
            Need a quick answer?
          </p>
          <h2 className="mt-3 font-display text-3xl text-charcoal-900">Use the pages that matter most</h2>
          <p className="mt-3 text-sm leading-7 text-charcoal-900/68">
            If you’re looking for policies, support, or how the platform works, the links on this page
            will take you there without making the experience feel cold or technical.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/privacy-policy">
              <Button variant="secondary">Privacy Policy</Button>
            </Link>
            <Link to="/terms-of-service">
              <Button variant="secondary">Terms of Service</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary">Contact</Button>
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-plum-700/10 bg-[linear-gradient(180deg,rgba(255,250,244,0.96)_0%,rgba(248,238,228,0.94)_100%)] p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
            What to expect
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-charcoal-900/72">
            <p>
              Celebration pages are shareable, warm, and easy to use on desktop and mobile web.
            </p>
            <p>
              Wishes, guestbook memories, gifts, and wallet activity are all designed to feel clear and
              trustworthy.
            </p>
            <p>
              When you need help, this page stays gentle and grounded instead of feeling like a generic help center.
            </p>
          </div>
        </section>
      </div>
    </PublicInfoLayout>
  );
}
