import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { PageTransition } from "../../components/animations/PageTransition";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

const heroWishes = [
  {
    author: "From Muma",
    className: "left-[-1%] top-12 block sm:left-0 sm:top-16 lg:left-0 lg:top-12",
    color: "bg-white/92",
    message: "May this year hold everything you've prayed for.",
    rotate: "-rotate-[8deg]",
    size: "h-[8.5rem] w-[7.5rem] sm:h-40 sm:w-36 lg:h-44 lg:w-40"
  },
  {
    author: "From Tessa",
    className: "right-[-1%] top-12 block sm:right-0 sm:top-16 lg:right-0 lg:top-12",
    color: "bg-white/92",
    message: "So proud of who you've become. Truly deserved.",
    rotate: "rotate-[9deg]",
    size: "h-[8.5rem] w-[7.5rem] sm:h-40 sm:w-36 lg:h-44 lg:w-40"
  },
  {
    author: "From Mum",
    className: "left-1/2 top-10 -translate-x-1/2 sm:top-12 lg:top-9",
    color: "bg-white/96",
    message: "Every wish becomes a keepsake.",
    rotate: "rotate-0",
    size: "h-[9rem] w-[8rem] sm:h-44 sm:w-40 lg:h-48 lg:w-44"
  },
  {
    author: "From the team",
    className: "left-[-1%] bottom-10 block sm:left-0 sm:bottom-12 lg:left-0 lg:bottom-12",
    color: "bg-white/92",
    message: "Cheers to the next chapter and everything that follows.",
    rotate: "rotate-[8deg]",
    size: "h-[8.5rem] w-[7.5rem] sm:h-40 sm:w-36 lg:h-44 lg:w-40"
  },
  {
    author: "From Deli",
    className: "right-[-1%] bottom-10 block sm:right-0 sm:bottom-12 lg:right-0 lg:bottom-12",
    color: "bg-white/92",
    message: "Forever grateful for you, your kindness, and your light.",
    rotate: "-rotate-[8deg]",
    size: "h-[8.5rem] w-[7.5rem] sm:h-40 sm:w-36 lg:h-44 lg:w-40"
  },
];

const glimpseNotes = [
  {
    author: "Funmi",
    message: "You found a love that mirrors your kindness. So happy for you both."
  },
  {
    author: "Uncle Bayo",
    message: "Watching you grow into this moment has been a joy beyond words."
  },
  {
    author: "Lola",
    message: "Marriage looks good on you already. Here's to forever, my friend."
  },
  {
    author: "Grandma",
    message: "My darling girl, may your home be full of laughter always."
  }
];

const howItWorks = [
  {
    step: "01",
    title: "Create your celebration page",
    body: "Choose the moment and add the details that matter."
  },
  {
    step: "02",
    title: "Invite everyone with one link",
    body: "Guests can open the page instantly without creating an account."
  },
  {
    step: "03",
    title: "Collect wishes, memories, and gifts",
    body: "Gather wishes, memories, reactions, and gifts in one place."
  },
  {
    step: "04",
    title: "Turn it all into a keepsake",
    body: "Keep the wall as something you can revisit or export later."
  }
];

const giftNotes = [
  "Gifts arrive alongside the wish, never separately.",
  "Withdraw to your bank in a few taps.",
  "A simple ledger of every kindness received."
];

const faqItems = [
  {
    answer: "No. Guests can open the celebration link and leave a wish, memory, or gift without creating an account.",
    question: "Do guests need an account?"
  },
  {
    answer: "Yes. Celebrations can be exported as JPG, PNG, or PDF so the wall can live on beyond the event.",
    question: "Can I save the wall?"
  },
  {
    answer: "Yes. The Wish Wall and guestbook are built to feel soft, readable, and polished on mobile browsers too.",
    question: "Does it work well on phones?"
  },
  {
    answer: "Privacy Policy and Terms of Service are linked in the footer, and you can always reach out from the contact page.",
    question: "Where can I find the important pages?"
  }
];

export function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const primaryHref = isAuthenticated
    ? user?.role === "admin"
      ? "/admin"
      : "/dashboard"
    : "/register";

  return (
    <PageTransition>
      <main className="overflow-hidden">
        <section className="relative px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pb-12 lg:pt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[52rem] bg-[radial-gradient(circle_at_top_left,rgba(247,217,220,0.55),transparent_34%),radial-gradient(circle_at_top_right,rgba(213,162,76,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,250,244,0.94)_100%)]" />
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="fixed inset-x-4 top-4 z-40 sm:inset-x-6 lg:inset-x-8"
            >
              <header className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/70 bg-[rgba(255,250,244,0.92)] px-4 py-3 shadow-[0_12px_40px_rgba(67,34,53,0.08)] backdrop-blur-md sm:px-6">
                <Link to="/" className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-plum-800/12 bg-white text-[0.95rem] font-semibold text-plum-800 shadow-[0_8px_20px_rgba(67,34,53,0.06)]">
                    P
                  </span>
                  <span className="text-[1.05rem] font-medium tracking-[0.02em] text-plum-800">
                    Pen A <span className="font-display italic text-[1.06rem]">Wish</span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-8 text-[0.95rem] text-charcoal-900/70 lg:flex">
                  <a href="#how-it-works">How it works</a>
                  <a href="#how-it-comes-together">Events</a>
                  <a href="#gift-preview">Gifts</a>
                  <a href="#faq">FAQ</a>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    aria-expanded={isMobileNavOpen}
                    aria-controls="mobile-nav"
                    aria-label="Toggle navigation"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/82 text-plum-800 shadow-[0_8px_24px_rgba(67,34,53,0.05)] transition hover:-translate-y-0.5 lg:hidden"
                    onClick={() => setIsMobileNavOpen((current) => !current)}
                  >
                    <motion.span
                      key={isMobileNavOpen ? "close" : "menu"}
                      initial={{ opacity: 0, rotate: -12, scale: 0.85 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-lg leading-none"
                    >
                      {isMobileNavOpen ? "×" : "☰"}
                    </motion.span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden rounded-full border border-white/60 bg-transparent px-5 text-plum-800 shadow-none hover:bg-white/70 lg:inline-flex"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="hidden rounded-full px-5 shadow-[0_10px_24px_rgba(67,34,53,0.10)] lg:inline-flex"
                    onClick={() => navigate(primaryHref)}
                  >
                    Create your page
                  </Button>
                </div>
              </header>
            </motion.div>

            {isMobileNavOpen ? (
              <div className="fixed left-4 right-4 top-[4.75rem] z-50 sm:left-6 sm:right-6 lg:hidden">
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  id="mobile-nav"
                  className="rounded-[28px] border border-white/35 bg-white/18 p-3 shadow-[0_24px_60px_rgba(67,34,53,0.12)] backdrop-blur-xl"
                >
                  <nav className="grid gap-2 text-sm text-plum-800">
                    <a
                      href="#how-it-works"
                      className="rounded-[18px] border border-white/30 bg-white/10 px-4 py-3 transition hover:bg-white/22"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      How it works
                    </a>
                    <a
                      href="#how-it-comes-together"
                      className="rounded-[18px] border border-white/30 bg-white/10 px-4 py-3 transition hover:bg-white/22"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Events
                    </a>
                    <a
                      href="#gift-preview"
                      className="rounded-[18px] border border-white/30 bg-white/10 px-4 py-3 transition hover:bg-white/22"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Gifts
                    </a>
                    <a
                      href="#faq"
                      className="rounded-[18px] border border-white/30 bg-white/10 px-4 py-3 transition hover:bg-white/22"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      FAQ
                    </a>
                    <button
                      type="button"
                      className="rounded-[18px] border border-white/30 bg-white/10 px-4 py-3 text-left transition hover:bg-white/22"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        navigate("/login");
                      }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="rounded-[18px] bg-plum-800/90 px-4 py-3 text-left font-semibold text-white shadow-[0_10px_24px_rgba(67,34,53,0.16)]"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        navigate(primaryHref);
                      }}
                    >
                      Create your page
                    </button>
                  </nav>
                </motion.div>
              </div>
            ) : null}

            <div className="relative z-10 mt-0 overflow-hidden rounded-[42px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.99)_0%,rgba(255,246,238,0.97)_100%)] px-4 pt-0 shadow-[0_24px_80px_rgba(67,34,53,0.1)] sm:px-6 lg:px-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_30%),radial-gradient(circle_at_top_right,rgba(247,217,220,0.42),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(213,162,76,0.12),transparent_26%)]" />
              <div className="relative min-h-[40rem] sm:min-h-[44rem] lg:min-h-[40rem]">
                {heroWishes.map((wish, index) => (
                  <motion.article
                    key={wish.author}
                    initial={{ opacity: 0, y: 20, scale: 0.94 }}
                    animate={{
                      opacity: 1,
                      y: [0, -6, 0],
                      rotate: 0,
                      scale: 1
                    }}
                    transition={{
                      delay: index * 0.07,
                      duration: 5.8 + index * 0.3,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                    className={`absolute ${wish.className} ${wish.rotate} ${wish.size} overflow-hidden rounded-[22px] border border-white/65 ${wish.color} p-2 shadow-[0_18px_42px_rgba(67,34,53,0.12)] backdrop-blur-md lg:p-2.5`}
                  >
                    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-white/45 bg-white/70 p-2 text-charcoal-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] lg:p-2.5">
                      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-charcoal-900/48">
                        {wish.author.toUpperCase()}
                      </p>
                      <div className="mt-2 flex-1 overflow-hidden">
                        <p className="font-display text-[0.72rem] font-normal italic leading-[1.2] text-plum-800 sm:text-[0.82rem] lg:text-[0.9rem]">
                          {wish.message}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  className="relative mx-auto flex max-w-3xl flex-col items-center pt-[15rem] text-center sm:pt-[13rem] lg:pt-[14rem]"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-gold-400">
                    A keepsake for every celebration
                  </p>
                  <h1 className="mt-5 max-w-4xl font-display text-[2.35rem] leading-[0.98] text-charcoal-900 sm:text-[3.45rem] lg:text-[4.45rem]">
                    Every wish, kept forever.
                  </h1>
                  <p className="mt-5 max-w-2xl text-[0.88rem] leading-7 text-charcoal-900/66 sm:text-[1rem] sm:leading-8">
                    Pen A Wish gathers messages, memories, and gifts in one lasting wall.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" onClick={() => navigate(primaryHref)}>
                      Create an Event
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold-400">
                A glimpse inside
              </p>
              <h2 className="mt-4 font-display text-[2.65rem] leading-[1.02] text-charcoal-900 sm:text-[3.5rem]">
                The wall, <span className="italic text-plum-700">beautifully kept</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-charcoal-900/68 sm:text-base">
                Every message arrives as its own little keepsake - collected, arranged, and ready to revisit any time.
              </p>
            </div>

            <div className="mt-10 rounded-[32px] border border-[#ead7bf] bg-[#ead5b8]/70 px-5 py-8 shadow-[0_20px_60px_rgba(67,34,53,0.08)] sm:px-8 sm:py-10">
              <div className="text-center">
                <h3 className="font-display text-3xl text-plum-800 sm:text-[2.35rem]">
                  Adaeze&apos;s Bridal Celebration
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-charcoal-900/48">
                  62 wishes gathered · June 2026
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {glimpseNotes.map((note, index) => (
                  <motion.article
                    key={note.author}
                    initial={{ opacity: 0, y: 12, rotate: -1 }}
                    whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -2 : 2 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="min-h-[13rem] rounded-[18px] border border-white/70 bg-white px-4 py-4 shadow-[0_10px_22px_rgba(67,34,53,0.08)]"
                    style={{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }}
                  >
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gold-400">
                      {note.author}
                    </p>
                    <p className="mt-3 font-display text-[1.05rem] italic leading-[1.55] text-plum-800">
                      {note.message}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-comes-together" className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-7xl rounded-[38px] border border-white/70 bg-white/82 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-400">
                Simple, by design
              </p>
              <h2 className="mt-4 font-display text-[2.5rem] leading-[1.02] text-charcoal-900 sm:text-[3.4rem]">
                How it <span className="italic text-plum-700">comes together</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-charcoal-900/68 sm:text-base">
                No clutter, no learning curve - just three gentle steps between you and a wall full of love.
              </p>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white shadow-[0_10px_20px_rgba(67,34,53,0.06)]">
                    <span className="font-display text-lg text-plum-800">{index + 1}</span>
                  </div>
                  <h3 className="mt-6 font-display text-[1.55rem] text-charcoal-900">
                    {item.title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-charcoal-900/68">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="gift-preview" className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-400">
                A gift, alongside the words
              </p>
              <h2 className="mt-4 font-display text-[2.6rem] leading-[1.02] text-charcoal-900 sm:text-[3.55rem]">
                Let love come with a <span className="italic text-plum-700">little something extra</span>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-charcoal-900/68 sm:text-base">
                Beyond a kind message, visitors can leave a gift too. It settles quietly into your wallet, ready whenever you are.
              </p>

              <div className="mt-6 grid gap-3 text-sm leading-7 text-charcoal-900/70">
                {giftNotes.map((note) => (
                  <p key={note} className="flex items-start gap-3">
                    <span className="mt-1 text-gold-400">✦</span>
                    <span>{note}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#f0dfc9] bg-[#f8ebd7] p-5 shadow-[0_20px_50px_rgba(67,34,53,0.08)] sm:p-6">
              <div className="rounded-[22px] border border-[#efdcc1] bg-[#fbf4e7] p-5">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-gold-400">
                  Wallet balance
                </p>
                <p className="mt-4 text-center font-display text-[2.4rem] text-plum-800">
                  ₦82,400
                </p>
                <div className="mt-6 border-t border-[#e8d6bc] pt-4 text-sm">
                  <div className="flex items-center justify-between py-3">
                    <span>Funmi sent a gift</span>
                    <span className="font-semibold text-charcoal-900">₦10,000</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e8d6bc] py-3">
                    <span>Uncle Bayo sent a gift</span>
                    <span className="font-semibold text-charcoal-900">₦25,000</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e8d6bc] py-3">
                    <span>Lola sent a gift</span>
                    <span className="font-semibold text-charcoal-900">₦5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-400">
                Questions, answered
              </p>
              <h2 className="mt-4 font-display text-[2.6rem] leading-[1.02] text-charcoal-900 sm:text-[3.35rem]">
                Before you <span className="italic text-plum-700">begin</span>
              </h2>
            </div>

            <div className="mt-10 divide-y divide-[#ead8c4] rounded-[28px] border border-[#ead8c4] bg-white/70 px-2 shadow-card">
              {faqItems.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 text-left text-[0.98rem] text-charcoal-900">
                    <span>{item.question}</span>
                    <span className="text-xl text-gold-400 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-4 pt-4 text-sm leading-7 text-charcoal-900/68">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[30px] border border-white/65 bg-white/72 px-6 py-6 text-sm text-charcoal-900/66 shadow-[0_10px_30px_rgba(67,34,53,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold uppercase tracking-[0.24em] text-plum-700">
                Pen A Wish
              </p>
              <p className="mt-2">
                Celebration pages for wishes, memories, and gifts.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">Create an account</Link>
              <Link to="/login">Login</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </main>
    </PageTransition>
  );
}
