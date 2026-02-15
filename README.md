# 💰 CashCue

<div align="center">

**AI-Powered Personal Finance & Tax Optimization Platform**

A comprehensive financial management application built with React, TypeScript, and Firebase, featuring real-time Indian stock market integration and AI-driven tax insights.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.9-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

🔗 **Live Demo**: [https://cashcue.vercel.app/](https://cashcue.vercel.app/)

[Features](#-features) • [Demo](https://drive.google.com/drive/folders/1F9ryYZF1SdLK4CZa0GzUX9xxBZ76N3ZN) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Overview

CashCue is an intelligent financial management platform that helps users track expenses, manage investment portfolios, and optimize taxes using AI-powered insights. With real-time Indian stock market data integration and smart budget tracking, CashCue makes personal finance management effortless.

## ✨ Features

### 📊 **Portfolio Management**
- **Real-time Stock Prices**: Integration with Indian Stock Market API (NSE/BSE)
- **Auto-refresh**: Prices update automatically every 5 minutes
- **Manual Refresh**: On-demand price updates with loading indicators
- **Market Status**: Live display of market hours (9:15 AM - 3:30 PM IST)
- **Tax Classification**: Automatic STCG/LTCG classification
- **Performance Metrics**: Gain/loss tracking, holding period analysis

### 💸 **Expense Tracking**
- **Smart Categorization**: 7+ categories (Food, Transport, Healthcare, Utilities, etc.)
- **SMS Integration**: Auto-parse expense SMS messages
- **Budget Alerts**: Real-time budget status and warnings
- **Visual Analytics**: Monthly spending charts and trends
- **Date-based Filtering**: Track expenses by date range

### 🤖 **AI-Powered Insights**
- **Tax Optimization**: AI-driven tax-loss harvesting recommendations
- **Portfolio Health Score**: Comprehensive portfolio analysis
- **Scenario Comparison**: What-if analysis for tax planning
- **Urgent Actions**: Highlighted time-sensitive recommendations
- **Timeline View**: Tax planning calendar and deadlines

### 💰 **Budget Management**
- **Monthly Budgets**: Set and track monthly spending limits
- **Category Budgets**: Individual budgets for each expense category
- **Smart Recommendations**: AI-powered budget suggestions
- **Real-time Updates**: Live budget status and remaining amounts
- **Overspending Alerts**: Proactive warnings when nearing limits

### 🎨 **User Experience**
- **Dark Theme**: Beautiful, modern dark UI optimized for readability
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Sync**: Firebase integration for instant data updates
- **Secure Authentication**: Firebase Auth with email/password

---

## 🖼️ Demo

📹 [View Demo Videos & Screenshots](https://drive.google.com/drive/folders/1LA3XPQjMJmlxm30Zu9qzAvPyVzW6oohZ)

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Firebase Account** with Firestore database
- **Groq API Key** (for AI features)

### 1. Clone the Repository

```bash
git clone https://github.com/amanbangeraa/CashCue.git
cd CashCue
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Groq AI API Key
VITE_GROQ_API_KEY=your_groq_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Email/Password
4. Create **Firestore Database** in production mode
5. Copy configuration values to `.env`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📖 Usage

### First-Time Setup

1. **Sign Up**: Create an account using email and password
2. **Add Stocks**: Navigate to Portfolio → Add your stock holdings
3. **Track Expenses**: Go to Expenses → Add your first expense
4. **Set Budget**: Visit Budget → Configure monthly limits

### Seeding Demo Data

To quickly populate your portfolio with demo data for testing:

```bash
npm run seed-portfolio <your-email> <your-password>
```

Example:
```bash
npm run seed-portfolio demo@test.com MyPassword123
```

This adds 9 demo stocks (~₹13.5L portfolio) perfect for AI analysis.

### Key Workflows

#### 📈 Portfolio Management
1. Add stocks with ticker symbols (e.g., `INFY.NS`, `RELIANCE.NS`)
2. Prices auto-refresh every 5 minutes
3. View gain/loss, tax type (STCG/LTCG)
4. Get AI-powered tax optimization recommendations

#### 💳 Expense Tracking
1. Add expenses manually or via SMS simulator
2. Categorize spending across 7+ categories
3. View monthly charts and trends
4. Get budget warnings in real-time

#### 🎯 Tax Analysis
1. View portfolio on Dashboard
2. AI analyzes holdings and generates insights
3. Review tax-loss harvesting opportunities
4. Implement recommendations before March 31

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7.3** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Recharts 3.7** - Data visualization
- **Lucide React** - Icons

### Backend & Services
- **Firebase 12.9**
  - Authentication (Email/Password)
  - Firestore (Real-time database)
- **Indian Stock Market API** - Real-time NSE/BSE prices
- **Groq SDK** - AI-powered insights

### Utilities
- **date-fns** - Date manipulation
- **tsx** - TypeScript execution

---

## 📁 Project Structure

```
cashCue/
├── src/
│   ├── components/          # React components
│   │   ├── ai/             # AI insight components
│   │   ├── auth/           # Authentication
│   │   ├── budget/         # Budget management
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── expenses/       # Expense tracking
│   │   ├── income/         # Income sources
│   │   ├── portfolio/      # Stock portfolio
│   │   ├── shared/         # Shared components
│   │   └── ui/             # UI primitives
│   ├── context/            # React Context providers
│   ├── lib/                # Firebase configuration
│   ├── pages/              # Main page components
│   ├── services/           # Business logic
│   │   ├── aiAnalyzer.ts   # AI insights
│   │   ├── indianStockAPI.ts # Stock API
│   │   ├── smsParser.ts     # SMS parsing
│   │   └── autoExpenseTracker.ts
│   ├── types/              # TypeScript types
│   ├── utils/              # Helper functions
│   └── styles/             # Design system
├── public/                 # Static assets
├── seed-portfolio.ts       # Demo data seeder
├── .env                    # Environment variables
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── tailwind.config.js      # Tailwind config
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run seed-portfolio` | Seed demo portfolio data |

---

## 🌐 API Integration

### Indian Stock Market API

**Base URL**: `https://military-jobye-haiqstudios-14f59639.koyeb.app`

**Features**:
- Free, no authentication required
- NSE (.NS) and BSE (.BO) support
- Real-time price data
- Search functionality

**Example Usage**:
```typescript
// Get stock data
GET /stock/INFY.NS

// Search stocks
GET /search?query=infosys

// Multiple stocks
GET /stocks?symbols=INFY.NS,TCS.NS,RELIANCE.NS
```

---

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ Firebase Authentication
- ✅ Firestore security rules (user-scoped data)
- ✅ No API keys exposed in frontend
- ⚠️ **Note**: Never commit `.env` to version control

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Manual Build

```bash
npm run build
# Deploy dist/ folder to any static hosting
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aman Bangera**

- GitHub: [@amanbangeraa](https://github.com/amanbangeraa)
- Repository: [CashCue](https://github.com/amanbangeraa/CashCue)

---

## 🙏 Acknowledgments

- [Indian Stock Market API](https://github.com/haiqstudios/indian-stock-market-api) - Free stock data
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Groq](https://groq.com/) - AI inference
- [Recharts](https://recharts.org/) - Data visualization
- [Lucide](https://lucide.dev/) - Beautiful icons

---

## 📞 Support

For issues or questions:
- 🐛 [Open an Issue](https://github.com/amanbangeraa/CashCue/issues)
- 💬 Discussions: Use GitHub Discussions
- 📧 Email: [Contact via GitHub](https://github.com/amanbangeraa)

---

<div align="center">

**Made with ❤️ using React, TypeScript, and Firebase**

⭐ Star this repo if you find it helpful!

</div>
