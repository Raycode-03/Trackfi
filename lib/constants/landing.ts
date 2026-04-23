import { LineChart, PieChart, Bell, Clock } from "lucide-react";

export const thisYear = new Date().getFullYear();

// ─── Alerts Section ───────────────────────────────────────────────────────────
export const alerts = {
  badge: "Smart Alerts",
  heading: "Automated Alerts That Work For You",
  description:
    "Don't spend your day staring at charts. Set your parameters and let our intelligent alert engine do the heavy lifting. Your targets and your life, on your terms.",
  sampleAlert: {
    label: "Price Alert: BTC > $55,000",
    status: "Active",
  },
  cta: "Set Your First Alert",
};

// ─── Hero Section ─────────────────────────────────────────────────────────────
export const hero = {
  heading: ["Track Your", "Crypto.", "Own", "Your Finances."],
  accentWord: "Own",
  description:
    "The ultimate dashboard to monitor your portfolio, set price alerts, and gain deep insights into your financial future.",
  primaryCta: "Get Started",
  secondaryCta: "See How It Works",
  trustedBy: "Trusted by",
  trustedBrands: ["CRYPTO", "BLOCK VENTURES", "HOMESTREAM", "BETLABS", "INTRASET"],
};

// ─── Features Section ─────────────────────────────────────────────────────────
export const featuresHeading = {
  title: "Everything you need to master your assets.",
  description:
    "Track8 provides real-time tools and advanced analytics to help you make smarter financial moves.",
};

export const features = [
  {
    icon: LineChart,
    title: "Live Data Stream",
    description:
      "Access live price streams, realtime market ticks, and up-to-the-second financial data across hundreds of assets.",
    image: "/images/image-2.png",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: PieChart,
    title: "Portfolio P&L",
    description:
      "Visualise gains and losses across your entire portfolio with advanced charting, tracking, and detailed breakdowns.",
    image: null,
    span: "col-span-1",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description:
      "Set custom triggers for price movements so you never miss a critical market signal or trading opportunity.",
    image: null,
    span: "col-span-1",
  },
  {
    icon: Clock,
    title: "Transaction History",
    description:
      "Every trade logged and searchable. Full history designed for seamless accurate record keeping and tax reporting.",
    image: null,
    span: "col-span-1 md:col-span-2",
  },
];

// ─── Market Coverage Section ──────────────────────────────────────────────────
export const marketCoverage = {
  badge: "Live Market Data",
  heading: "Real-Time Global Market Coverage",
  description:
    "Monitor thousands of prices across major exchanges. Get ultra-fast API access dedicated to seeing the price at the moment, not fractions of a second ago.",
};

export const bullets = [
  "Hold 250+ Cryptocurrencies",
  "Custom Watchlists",
  "Ultra-low Latency Price Feeds",
  "Multi-exchange Aggregation",
];

// ─── Portfolio Section ────────────────────────────────────────────────────────
export const portfolio = {
  badge: "Portfolio Intelligence",
  heading: "Visual Portfolio Intelligence",
  description:
    "Get a holistic view of your wealth. We consolidate your coin holdings, exchange accounts, and traditional balances into one luminous signal.",
  cta: "Explore Analytics",
};

// ─── Steps Section ────────────────────────────────────────────────────────────
export const stepsHeading = "Your Journey in 3 Simple Steps";

export const steps = [
  {
    number: "01",
    title: "Create Account",
    description:
      "Sign up in seconds with bank-grade security and streamlined onboarding features.",
  },
  {
    number: "02",
    title: "Add/Manage Assets",
    description:
      "Add your crypto holdings and connect your exchanges. Manage your portfolio data from day one.",
  },
  {
    number: "03",
    title: "Monitor Your History",
    description:
      "Track performance over time, review transactions, and analyse your financial history.",
  },
];

// ─── Stats Section ────────────────────────────────────────────────────────────
export const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50+", label: "Coins Supported" },
  { value: "99.9%", label: "Uptime" },
];

// ─── Testimonials Section ─────────────────────────────────────────────────────
export const testimonialsHeading = {
  eyebrow: "What people say",
  title: "Voice of the Evolution",
};

export const testimonials = [
  {
    name: "Alex Chen",
    handle: "@alexc",
    rating: 5,
    text: "This tool completely changed how I manage my crypto. The portfolio dashboard is incredibly detailed and the alerts are spot on.",
  },
  {
    name: "Sarah Omar",
    handle: "@sarahomar",
    rating: 5,
    text: "I've tried many crypto trackers but the UX on this is unmatched. The real-time data is as fast as any professional tool I've used.",
  },
  {
    name: "Marcus Rivera",
    handle: "@mrivera",
    rating: 5,
    text: "Our wealth management improved dramatically after switching to Track8. A brilliant product — our portfolio is actually tracked properly now.",
  },
  {
    name: "Priya Nair",
    handle: "@priyanair",
    rating: 5,
    text: "The price alert system alone is worth every penny. I haven't missed a single major price movement since I started using Track8.",
  },
  {
    name: "James Okafor",
    handle: "@jamesokafor",
    rating: 5,
    text: "Clean interface, fast data, and no bloat. Exactly what a serious crypto investor needs. I recommended it to my entire trading group.",
  },
  {
    name: "Lena Müller",
    handle: "@lenamueller",
    rating: 5,
    text: "The transaction history export saved me hours during tax season. Having everything in one place and exportable as CSV is a game changer.",
  },
  {
    name: "Daniel Park",
    handle: "@dpark_inv",
    rating: 5,
    text: "I was skeptical at first but after one week I cancelled every other tracker I was paying for. Track8 does it all and does it better.",
  },
  {
    name: "Fatima Al-Rashid",
    handle: "@fatima_crypto",
    rating: 5,
    text: "The multi-exchange aggregation is seamless. I can finally see my full net worth across Binance, Coinbase, and Kraken in one glance.",
  },
  {
    name: "Tom Eriksson",
    handle: "@tomcrypto",
    rating: 5,
    text: "Track8's uptime is phenomenal. I've never once experienced downtime during a volatile market session — exactly when reliability matters most.",
  },
  {
    name: "Yuki Tanaka",
    handle: "@yukitanaka",
    rating: 5,
    text: "As someone managing a portfolio across 30+ assets, Track8 is a lifesaver. The P&L breakdowns are detailed without being overwhelming.",
  },
];

// ─── Pricing Section ──────────────────────────────────────────────────────────
export const pricingHeading = {
  eyebrow: "Pricing",
  title: "Simple, Transparent Pricing",
};

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started with the basics.",
    features: ["5 Alerts", "Basic Portfolio", "Limited History"],
    cta: "Start for Free",
    highlight: false,
    link: '/signup'
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    description: "For active crypto investors",
    features: [
      "Unlimited Alerts",
      "Full Portfolio P&L",
      "Full Transaction History",
      "Priority Support",
      "CSV Exports",
    ],
    cta: "Get Pro",
    highlight: true,
    link: 'https://buy.stripe.com/test_7sY3cw8ZZ5bt6c7de8fQI00'
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "/mo",
    description: "For teams and power users.",
    features: [
      "Everything in Pro",
      "Multi-user Access",
      "Dedicated Account Manager",
      "Advanced Analytics",
      "Custom Integrations",
    ],
    cta: "Get Enterprise",
    highlight: false,
    link:'https://buy.stripe.com/test_fZu8wQ6RRavNasnfmgfQI01'
  },
];

// ─── FAQ Section ──────────────────────────────────────────────────────────────
export const faqHeading = "Frequently Asked Questions";

export const faqs = [
  {
    question: "Is it free to use?",
    answer:
      "Yes, Track8 has a free tier that gives you access to core features including basic portfolio tracking and up to 5 price alerts.",
  },
  {
    question: "What exchanges are supported?",
    answer:
      "We support all major exchanges including Binance, Coinbase, Kraken, and many more. New integrations are added regularly.",
  },
  {
    question: "Can I track multiple exchanges?",
    answer:
      "Pro and Enterprise users can connect and consolidate data from multiple exchanges into one unified dashboard.",
  },
  {
    question: "Is a mobile app available?",
    answer:
      "Our platform is fully responsive and optimised for mobile browsers. A dedicated native app is on our roadmap.",
  },
  {
    question: "Do you support tax reporting?",
    answer:
      "Yes, Pro users can export full transaction history as CSV for use with popular crypto tax tools and accountants.",
  },
];

// ─── CTA Section ──────────────────────────────────────────────────────────────
export const cta = {
  heading: "Start tracking your crypto today.",
  description:
    "Join thousands of investors who trust Track8 to monitor their portfolio 24/7.",
  button: "Get Started Free",
};

// ─── Footer ───────────────────────────────────────────────────────────────────
export const footer = {
  brand: "Track8",
  tagline: "The ultimate crypto portfolio tracker for modern investors.",
  copyright: `© ${thisYear} Track8. All rights reserved.`,
  taglineBottom: "Built for the financial future.",
  socials: ["X", "in", "gh"],
};

export const links: Record<string, string[]> = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Docs", "API Reference", "Status", "Support"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "Licenses"],
};