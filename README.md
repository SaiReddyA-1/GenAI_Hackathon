# Startup Analyzer

A comprehensive web application that provides detailed startup analysis using AI and market data.

## Features

- Dynamic startup idea analysis
- Interactive data visualization
- Market research and competitor analysis
- AI-powered insights and suggestions
- Dark/Light mode support
- PDF export functionality

## Prerequisites

- Node.js (v14 or higher)
- Firebase account and project
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase and OpenAI credentials:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm start
```

## Tech Stack

- React.js
- Material-UI
- Firebase (Auth, Firestore, Storage, Functions)
- OpenAI API
- Recharts for data visualization
- jsPDF for PDF generation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
