# StockPulse 📈

A modern, AI-powered stock market tracking application built with Next.js 15, featuring real-time price alerts, personalized watchlists, and intelligent market insights.

## ✨ Features

- **Real-Time Stock Tracking** - Monitor stock prices with interactive TradingView charts
- **Smart Watchlists** - Create personalized watchlists to track your favorite stocks
- **Price Alerts** - Set custom price thresholds and receive instant email notifications
- **Portfolio Tracker** - Track your investments and portfolio performance
- **Stock Comparison** - Compare multiple stocks side by side
- **AI Sentiment Analysis** - Get AI-powered news sentiment for any stock
- **Market Insights** - Explore detailed financial data, PE ratios, EPS, and analyst ratings
- **CSV Export** - Export your watchlist and portfolio data

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) with React 19
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose
- **Background Jobs**: [Inngest](https://www.inngest.com/)
- **Market Data**: [Finnhub API](https://finnhub.io/) + [TradingView Widgets](https://www.tradingview.com/)
- **AI**: [Groq](https://groq.com/) (LLaMA 3.1)
- **Email**: [Nodemailer](https://nodemailer.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Finnhub API key
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stockpulse.git
cd stockpulse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Configure your `.env` file with:
```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
FINNHUB_API_KEY=your_finnhub_key
GROQ_API_KEY=your_groq_key
NODEMAILER_EMAIL=your_email
NODEMAILER_PASSWORD=your_app_password
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
stockpulse/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and configurations
│   ├── actions/           # Server actions
│   ├── better-auth/       # Auth configuration
│   ├── inngest/           # Background job definitions
│   └── nodemailer/        # Email templates
├── database/              # MongoDB models
├── hooks/                 # Custom React hooks
└── public/                # Static assets
```

---

Built with Next.js and modern web technologies.
