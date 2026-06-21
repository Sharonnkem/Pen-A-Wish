import { Link } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { PublicInfoLayout } from "@/components/layout/PublicInfoLayout";

const supportTopics = [
  "Account access and password reset help",
  "Questions about public celebrations or Wish Walls",
  "Gift payment or wallet concerns",
  "Moderation, reports, or withdrawal questions"
] as const;

export function ContactPage() {
  return (
    <PublicInfoLayout
      eyebrow="Contact"
      title="Reach the Pen A Wish team with clarity and context"
      subtitle="Whether you need support with account access, public event pages, or payment-related concerns, this page keeps the next step easy."
      actions={
        <a href="mailto:support@penawish.com">
          <Button>support@penawish.com</Button>
        </a>
      }
    >
      <div className="space-y-6">
        <Card
          title="How to contact us"
          description="Email is the best channel for Version 1 support so we can keep a clean record of celebration, payment, or moderation issues."
        >
          <div className="space-y-4 text-sm leading-7 text-charcoal-900/72">
            <p>
              Send a message to <a className="font-semibold text-plum-800" href="mailto:support@penawish.com">support@penawish.com</a> with the event title, public link, or reference number when relevant.
            </p>
            <p>
              For account access requests, include the email address tied to your Pen A Wish account so we can help faster.
            </p>
          </div>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
          <Card
            tone="polaroid"
            title="Common support topics"
            description="These are the most useful details to include when you reach out."
          >
            <ul className="space-y-3 text-sm leading-7 text-charcoal-900/72">
              {supportTopics.map((topic) => (
                <li key={topic} className="rounded-[18px] bg-white/72 px-4 py-3">
                  {topic}
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Helpful links"
            description="These pages usually answer the most common product questions quickly."
          >
            <div className="grid gap-3">
              <Link to="/privacy-policy">
                <Button variant="secondary" className="w-full justify-center">
                  Privacy Policy
                </Button>
              </Link>
              <Link to="/terms-of-service">
                <Button variant="secondary" className="w-full justify-center">
                  Terms of Service
                </Button>
              </Link>
              <Link to="/forgot-password">
                <Button variant="ghost" className="w-full justify-center">
                  Forgot Password
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PublicInfoLayout>
  );
}
