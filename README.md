# Student Mental Health App 🧠💙

A comprehensive mental health application designed to promote mental wellness among higher education students through preventive care, peer support, and AI-driven insights.

## 🎯 Mission

To create a safe, supportive, and accessible platform that empowers students to take control of their mental health journey through evidence-based tools, community support, and personalized care.

## ✨ Core Features

### 🤖 AI-Driven Mental Health Support
- **Mood Tracking**: Daily mood logging with AI analysis and pattern recognition
- **Progress Insights**: Personalized insights and trend analysis
- **Risk Assessment**: Proactive identification of mental health concerns
- **Personalized Content**: AI-curated resources based on individual needs

### 👥 Community & Peer Support
- **Discussion Forums**: Safe spaces for sharing experiences and support
- **Peer Matching**: Connect with students facing similar challenges
- **Group Support**: Moderated support groups and virtual meetings
- **Anonymous Support**: Option for anonymous participation

### 🆘 Crisis Support & Emergency Features
- **Emergency Helpline Button**: One-tap access to crisis support
- **Crisis Detection**: AI-powered early warning system
- **Immediate Resources**: Quick access to emergency contacts and resources
- **Safety Planning**: Personalized crisis management plans

### 🎯 Goal Setting & Progress Tracking
- **Customizable Goals**: Set personal mental health objectives
- **Smart Reminders**: Gentle nudges for self-care activities
- **Progress Visualization**: Charts and analytics to track improvements
- **Milestone Celebrations**: Acknowledge achievements along the journey

### 🎮 Gamification & Engagement
- **Points System**: Earn points for healthy activities
- **Achievement Badges**: Unlock rewards for consistency and progress
- **Challenges**: Weekly wellness challenges with community participation
- **Leaderboards**: Friendly competition to encourage engagement

### 📚 Resource Library
- **Articles**: Curated mental health articles and research
- **Podcasts**: Mental wellness podcasts and guided sessions
- **Videos**: Educational content and therapeutic videos
- **Self-Help Tools**: Worksheets, assessments, and interactive tools

### 🧘 Wellness Tools
- **Breathing Exercises**: Guided breathing techniques for anxiety management
- **Meditation Library**: Mindfulness sessions for stress reduction
- **Sleep Tracking**: Monitor and improve sleep patterns
- **Stress Assessment**: Regular check-ins and coping strategy recommendations

### 🔒 Privacy & Security
- **End-to-End Encryption**: All sensitive data is encrypted
- **HIPAA Compliance**: Meets healthcare privacy standards
- **Anonymous Options**: Use the app without revealing identity
- **Data Control**: Users have full control over their data

### 📱 Accessibility Features
- **Offline Mode**: Key features work without internet connection
- **Multi-Platform**: Available on iOS, Android, and web
- **Accessibility Support**: Screen reader and accessibility tool compatible
- **Multiple Languages**: Localized content for diverse student populations

## 🏗️ Technical Architecture

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt encryption
- **AI Integration**: OpenAI API for insights and content generation
- **Real-time**: Socket.io for live chat and notifications

### Frontend
- **Web**: React with TypeScript
- **Mobile**: React Native with Expo
- **State Management**: Redux Toolkit with RTK Query
- **UI Framework**: React Native Elements / Material-UI
- **Charts**: Chart.js for data visualization

### Infrastructure
- **Hosting**: AWS/Azure cloud services
- **CDN**: CloudFlare for global content delivery
- **Monitoring**: Application performance monitoring
- **CI/CD**: GitHub Actions for automated deployment

## 📁 Project Structure

```
student-mental-health-app/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation middleware
│   │   ├── services/        # Business logic
│   │   └── config/          # Configuration files
│   └── tests/               # Backend tests
├── frontend/                # React web application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   └── services/        # API integration
│   └── public/              # Static assets
├── mobile/                  # React Native app
│   ├── src/
│   │   ├── components/      # Mobile components
│   │   ├── screens/         # App screens
│   │   └── navigation/      # Navigation setup
│   └── assets/              # Mobile assets
├── database/                # Database schemas and migrations
├── docs/                    # Documentation
└── scripts/                 # Build and deployment scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-mental-health-app
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   
   # Mobile (optional)
   cd ../mobile
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Database setup**
   ```bash
   # Start MongoDB locally or configure cloud connection
   # Run migrations
   cd backend
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   # Backend (runs on port 3001)
   cd backend
   npm run dev
   
   # Frontend (runs on port 3000)
   cd frontend
   npm start
   
   # Mobile development
   cd mobile
   expo start
   ```

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend `.env`**:
```env
PORT=3001
DATABASE_URL=mongodb://localhost:27017/mental-health-app
JWT_SECRET=your-super-secure-secret-key
OPENAI_API_KEY=your-openai-api-key
ENCRYPTION_KEY=your-encryption-key
SMTP_HOST=your-email-host
SMTP_USER=your-email
SMTP_PASS=your-email-password
```

**Frontend `.env`**:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Mobile tests
cd mobile
npm test
```

## 📦 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build

# Mobile
cd mobile
expo build:android
expo build:ios
```

### Docker Support
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

We welcome contributions from developers, mental health professionals, and students. Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🔐 Security & Privacy

- All sensitive data is encrypted at rest and in transit
- User privacy is our top priority
- Regular security audits and updates
- Compliance with FERPA, HIPAA, and GDPR where applicable
- Transparent data practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Crisis Resources

If you're in immediate danger or having thoughts of self-harm:
- **India**: National Suicide Prevention Lifeline: 9152987821
- **International**: Visit [findahelpline.com](https://findahelpline.com)
- **Campus**: Contact your university's counseling center

## 📞 Contact

For questions, suggestions, or support:
- Email: support@student-mental-health-app.com
- Documentation: [docs.student-mental-health-app.com](https://docs.student-mental-health-app.com)
- Issues: [GitHub Issues](https://github.com/your-org/student-mental-health-app/issues)

---

**Remember**: This app is designed to supplement, not replace, professional mental health care. Always consult with qualified healthcare providers for serious mental health concerns.
