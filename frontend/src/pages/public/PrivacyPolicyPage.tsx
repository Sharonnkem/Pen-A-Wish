import { PublicInfoLayout } from "@/components/layout/PublicInfoLayout";

const sections = [
  {
    body: [
      "Pen A Wish collects the information required to create celebration pages, authenticate users, process gifts, and send important product emails.",
      "This may include your name, email address, event details, uploaded images, public wishes, guestbook entries, and payment-related metadata."
    ],
    title: "What we collect"
  },
  {
    body: [
      "We use your information to power account access, public celebration pages, wallet records, payment verification, and notifications tied to your activity on the platform.",
      "Visitor-submitted wishes, memories, and reactions are processed so they can appear on event pages and Wish Walls."
    ],
    title: "How we use it"
  },
  {
    body: [
      "Payment verification is handled server-side through Paystack. Media uploads use Cloudinary, and email notifications use Resend.",
      "We do not rely on frontend-calculated money values when recording gifts or wallet updates."
    ],
    title: "Third-party services"
  },
  {
    body: [
      "Public celebration pages are intentionally shareable, so event details, wishes, and reactions may be visible to anyone with the event link unless hidden through moderation controls.",
      "Protected account areas require authentication and role-based access."
    ],
    title: "Public visibility"
  },
  {
    body: [
      "If you need support regarding your data, reach out through the Contact page so we can review the request carefully.",
      "This policy can be updated as the product grows, but Version 1 remains focused on the celebration and wallet features described in the project documents."
    ],
    title: "Questions and updates"
  }
] as const;

export function PrivacyPolicyPage() {
  return (
    <PublicInfoLayout
      eyebrow="Privacy Policy"
      title="How Pen A Wish handles celebration and account data"
      subtitle="A clear summary of how information is used across public event pages, gift flows, and protected creator dashboards."
    >
      <div className="space-y-6">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[26px] border border-plum-700/10 bg-cream-50/72 p-5"
          >
            <h2 className="font-display text-2xl text-charcoal-900">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-charcoal-900/72">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </PublicInfoLayout>
  );
}
