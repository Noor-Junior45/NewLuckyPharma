# 💊 New Lucky Pharma

**The official digital storefront for New Lucky Pharma — Hanwara's trusted chemist, serving the Hanwara and Godda (Jharkhand) community with genuine medicines, health tools, and AI-powered pharmacist guidance.**

🔗 **Live:** [newluckypharma.vercel.app](https://newluckypharma.vercel.app)

---

## 📖 About

New Lucky Pharma is a modern, SEO-optimized pharmacy web app built as a digital front door for a real local chemist shop. Beyond a simple product catalog, it combines e-commerce discovery, AI-driven health guidance, and Google Merchant/local-inventory integration — helping a neighborhood pharmacy compete with the reach of a full digital health platform.

The site lets customers browse 60+ medicines and healthcare products across categories like pain relief, antibiotics, baby care, Ayurveda, and supplements, chat with an AI Pharmacist for guidance, use interactive health calculators, and get directions or place inquiries directly — all wrapped in a fast, installable Progressive Web App experience.

## ✨ Features

- 🤖 **AI Pharmacist Chat** — A Gemini-powered assistant (`AIChat.tsx` + `geminiService.ts`) that answers health questions, recommends relevant products from the live catalog, and can ground responses with search grounding/citations.
- 🛍️ **Product Catalog** — 60+ products across 20 categories (Pain Relief, Antibiotics, Baby Care, Ayurveda, Homeopathy, Supplements, Medical Devices, and more), with detailed product modals, pricing, and deep-linkable product URLs (`?product_id=`) for shareable/SEO-friendly links.
- ❤️ **Wishlist** — Persistent (localStorage-backed) wishlist with toast notifications and a dedicated wishlist modal, including support for custom/AI-suggested products.
- 🧰 **Interactive Health Tools** — BMI calculator (metric/imperial), daily water intake calculator, medicine reminders with both digital and analog time pickers, a guided breathing/relaxation tool, and camera-based scanning support.
- 🏥 **Services & Health Tips** — Sections detailing store services (licensed chemist, health camps, ABHA card generation, doctor consultations) and curated wellness tips.
- ❓ **FAQ** — Answers to common questions on prescriptions, delivery, payments, returns, MRP/pricing, promotional offers, and ABHA card registration.
- 📞 **Contact & Emergency Contacts** — Store directions, contact form, and quick-access emergency contact numbers.
- 📈 **SEO & Structured Data** — Dynamic JSON-LD (`schema.org/Product`) injection per viewed product, XML sitemap, `robots.txt`, and auto-generated Google Merchant & local-inventory feeds (`scripts/generateFeed.ts`) for Google Shopping visibility.
- 📊 **Analytics & Monetization** — Google Analytics virtual page-view tracking on section navigation and Google AdSense ad placements.
- 📱 **PWA-ready & Responsive** — Smooth scroll-reveal animations, back-to-top control, welcome modal, and a mobile-first responsive layout via Tailwind CSS.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| AI | Google Gemini API (`@google/genai`) |
| Deployment | Vercel |
| SEO/Feeds | Custom feed generator script, JSON-LD, XML sitemap |
| Ads/Analytics | Google AdSense, Google Analytics (gtag) |

## 📁 Project Structure

```
NewLuckyPharma/
├── App.tsx                  # Root component & app-level state (wishlist, modals, SEO injection)
├── index.tsx / index.html   # App entry point
├── components/               # UI components (Navbar, Hero, Products, AIChat, HealthTools, etc.)
├── services/
│   └── geminiService.ts     # Gemini AI integration & response caching
├── data/
│   └── products.ts          # Product catalog data
├── scripts/
│   └── generateFeed.ts      # Google Merchant / local inventory feed generator
├── public/                  # Static assets, sitemap, robots.txt, verification files
├── types.ts                 # Shared TypeScript types
└── vercel.json               # Vercel routing & headers config
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [Gemini API key](https://ai.google.dev/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Noor-Junior45/NewLuckyPharma.git
cd NewLuckyPharma

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the project root and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Build for Production

```bash
npm run build
```

This runs TypeScript compilation, builds the Vite bundle, and regenerates the Google Merchant/local-inventory feeds.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

This project is configured for [Vercel](https://vercel.com/) deployment (see `vercel.json`) with SPA rewrites and cache-control headers already set up. Connect the repository to Vercel and set the `GEMINI_API_KEY` environment variable in the project settings.

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for supported versions and vulnerability reporting guidelines.

## 📍 About the Store

New Lucky Pharma is located on Main Road, Hanwara, Godda, Jharkhand (814154), operating as a licensed retail chemist serving the local community 7 days a week.

## 📄 License

This project currently has no explicit open-source license. All rights reserved unless stated otherwise.
