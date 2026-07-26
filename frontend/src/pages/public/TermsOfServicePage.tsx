import { PublicInfoLayout } from "../../components/layout/PublicInfoLayout";

const sections = [
  {
    body: [
      "Pen A Wish is a responsive web platform for creating celebration pages, collecting wishes and memories, and processing optional gift payments.",
      "By using the platform, you agree to use it for genuine celebration experiences and not for spam, abuse, or fraudulent payment activity."
    ],
    title: "Using the service"
  },
  {
    body: [
      "Account holders are responsible for the information they publish on celebration pages, including event details, uploaded images, and moderation choices for visitor content.",
      "Public visitors are responsible for the wishes, guestbook entries, reactions, and gift messages they submit."
    ],
    title: "User responsibilities"
  },
  {
    body: [
      "Gift payments are verified server-side before wallet balances are credited. Withdrawal requests are reviewed through the platform's admin workflow.",
      "Platform fees may apply to successful gift payments as described in the product flow."
    ],
    title: "Payments and withdrawals"
  },
  {
    body: [
      "Admins may remove spam wishes, review reports, and manage withdrawal requests to keep the platform safe and trustworthy.",
      "Publicly shared event pages and Wish Walls may remain visible to anyone with the link unless moderated or removed."
    ],
    title: "Moderation and public content"
  },
  {
    body: [
      "The service may evolve over time, but it will remain centered on the celebration, wallet, and sharing features described in Pen A Wish.",
      "If you have questions about these terms, use the Contact page to reach out."
    ],
    title: "Changes and support"
  }
] as const;

export function TermsOfServicePage() {
  return (
    <PublicInfoLayout
      eyebrow="Terms of Service"
      title="The basic ground rules for using Pen A Wish"
      subtitle="A warm but clear summary of account use, public celebration sharing, moderation, and payment-related responsibilities."
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
