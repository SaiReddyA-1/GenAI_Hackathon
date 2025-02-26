# Startup Analyzer

A comprehensive web application that leverages AI and market data to provide in-depth startup analysis, market insights, and competitive intelligence.

## Live Demo

[Visit the live application](https://genai-hackathon-8a609.web.app/)

## Features

- **AI-Powered Analysis**

  - Dynamic startup idea evaluation using both OpenAI and Google's Gemini AI
  - Intelligent market opportunity assessment
  - Real-time competitive analysis

- **Advanced Data Visualization**

  - Interactive market trend charts
  - Competitor analysis dashboards
  - Market share visualization
  - Growth trajectory projections

- **Market Intelligence**

  - Real-time Google Trends integration
  - Comprehensive market research
  - Competitor tracking and analysis
  - Industry insights and forecasts

- **User Experience**
  - Intuitive and responsive interface
  - Dark/Light mode support
  - Interactive chatbot assistance
  - PDF report generation and export

## Prerequisites

- Node.js (v14 or higher)
- Firebase account and project setup
- OpenAI API key
- Google Cloud project with Gemini API access

## Tech Stack

### Frontend

- React.js
- Material-UI for modern UI components
- Recharts for interactive data visualization
- jsPDF for report generation

### Backend & Services

- Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Cloud Functions
- OpenAI API for AI analysis
- Google's Gemini API for enhanced AI capabilities
- Google Trends API for market data

## Setup

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:

```bash
npm start
```

5. For Firebase Functions development:

```bash
cd functions
npm install
npm run serve
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their powerful AI API
- Google Cloud for Gemini AI and Trends API
- Firebase team for their comprehensive backend solution
- Material-UI team for the excellent UI components
