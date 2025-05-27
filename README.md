# 📧 My Inbox Report

> Transform your Gmail into actionable insights with AI-powered analytics

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**My Inbox Report** is an open-source tool that analyzes your Gmail to provide insights on subscriptions, spending patterns, newsletter sources, and email analytics—all while maintaining your privacy with zero data storage.

## ✨ Features

- 🔐 **Privacy First**: Zero data storage on our servers
- 🤖 **AI-Powered**: Uses Google Gemini and OpenAI GPT for email analysis
- 📊 **Smart Analytics**: Track subscriptions, spending, newsletters, and patterns
- 💾 **Local Storage**: All analytics stored securely in your browser
- 🚀 **Real-time Processing**: Lightning-fast email analysis
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Gmail API     │───▶│  Cloud LLMs      │───▶│ Browser Storage │
│   (OAuth)       │    │  (Gemini/GPT)    │    │ (IndexedDB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

1. **Gmail Integration**: Secure OAuth connection to your Gmail account
2. **AI Analysis**: Cloud-based LLMs analyze emails without storing your data
3. **Local Storage**: Analytics stored securely in your browser's local database
4. **View Reports**: Access detailed analytics and actionable insights

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gmail account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ashish-Sontakke/myinboxreport.git
   cd myinboxreport
   ```

2. **Install dependencies**
   ```bash
   npm install --force
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### LLM API Setup

#### OpenAI
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to environment variables

#### Google Gemini
1. Get API key from [Google AI Studio](https://makersuite.google.com/)
2. Add to environment variables

## 📊 Analytics Features

- **Active Subscriptions**: Track all your recurring subscriptions
- **Spending Analysis**: Monitor income and expenses from emails
- **Newsletter Insights**: Analyze newsletter sources and engagement
- **Email Patterns**: Understand your email behavior and trends
- **Sender Analytics**: Top senders and communication patterns
- **Time-based Reports**: Daily, weekly, monthly insights

## 🛡️ Privacy & Security

- ✅ **Zero Data Storage**: We never store your email data on our servers
- ✅ **Secure Processing**: Cloud APIs process data without retention
- ✅ **Local Analytics**: All insights stored in your browser only
- ✅ **OAuth Security**: Secure Gmail access via Google OAuth
- ✅ **GDPR Compliant**: Full compliance with privacy regulations

## 🧪 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Radix UI, Lucide Icons
- **Storage**: IndexedDB (via browser APIs)
- **AI**: OpenAI GPT, Google Gemini
- **Authentication**: Google OAuth 2.0

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [OpenAI](https://openai.com/) and [Google](https://ai.google/) for AI capabilities

## 📞 Support

- 🐛 [Report Issues](https://github.com/yourusername/myinboxreport/issues)
- 💬 [Discussions](https://github.com/yourusername/myinboxreport/discussions)
- 📧 Email: support@myinboxreport.com

## 🗺️ Roadmap

- [ ] Multi-email provider support (Outlook, Yahoo)
- [ ] Advanced filtering and search
- [ ] Export functionality (PDF, CSV)
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] Browser extension

---

<div align="center">
  <strong>Made with ❤️ by the open source community</strong>
</div>
