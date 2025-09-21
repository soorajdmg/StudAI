# StudAI - AI-Powered Personalized Study & Stress Relief Tool

StudAI is a full-stack web application that helps students learn based on their unique learning style and reduces academic stress through personalized tools and techniques.

## 🚀 Features

- **Learning Style Assessment** - 5-question test to identify your learning preferences (Visual, Auditory, Kinesthetic, Mixed)
- **Calibre Test** - Advanced learning curve assessment with adaptive difficulty and behavioral analysis
- **Smart Caliber Assessment** - AI-powered evaluation with multiple assessment modes and real-time analysis
- **Personalized Dashboard** - Customized study materials based on your learning profile
- **Landing Page** - Professional landing page with feature showcase and seamless user onboarding
- **Stress Relief Tools** - Pomodoro timer, breathing exercises, and AI chatbot for mental wellness
- **Study Materials** - Personalized content delivery based on learning style preferences
- **Profile Management** - Comprehensive user profile with learning analytics and progress tracking
- **Progress Tracking** - Monitor your learning journey and tool usage with detailed analytics
- **Admin Dashboard** - Analytics and user management for administrators with engagement metrics

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 + Vite 7.1.2, CSS3, React Router 7.9.1
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Generative AI (@google/generative-ai)
- **HTTP Client**: Axios 1.12.2
- **Styling**: Custom CSS with modern design principles and responsive layouts

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 20.19+ or 22.12+ recommended for Vite compatibility)
- MongoDB (local installation or MongoDB Atlas cloud database)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd StudAI
```

### 2. Set Up Backend
```bash
cd backend
npm install

# Create .env file with your MongoDB connection string
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/studai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development" > .env

# Start the backend server
npm run dev
```

### 3. Set Up Frontend
```bash
# In a new terminal, from the StudAI root directory
npm install

# Create .env file for frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start the frontend development server
npm run dev
```

### 4. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB Community Edition
- Start MongoDB service: `mongod`

**Option B: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace the `MONGODB_URI` in `backend/.env` with your Atlas connection string

## 🎯 Demo Flow

### For Hackathon Judges

1. **Registration & Login**
   - Visit `http://localhost:5173`
   - Create a new account with email/password
   - System automatically redirects to learning test

2. **Learning Style Assessment**
   - Complete 5-question multiple-choice test
   - Get classified into one of four learning profiles:
     - 🎨 Visual Learner
     - 🎧 Auditory Learner
     - ✋ Kinesthetic Learner
     - 🌟 Mixed Learner
   - Automatically proceed to Calibre Test for seamless experience

3. **Calibre Test (Learning Curve Assessment)**
   - Advanced adaptive assessment with behavioral analysis
   - Multiple learning topics (Math, Science concepts)
   - Real-time difficulty adjustment based on performance
   - Detailed learning curve analytics and insights

4. **Personalized Dashboard**
   - View your learning profile badge
   - See personalized study materials
   - Track progress with completion percentages
   - Access quick actions for stress relief tools

5. **Stress Relief Tools**
   - **Pomodoro Timer**: 25-minute focus sessions with breaks
   - **Breathing Exercise**: Guided 4-4-4 breathing animation
   - **AI Chatbot**: Study tips and motivational support

6. **Admin Dashboard** (Create admin user in MongoDB)
   - User analytics and learning type distribution
   - Engagement metrics and platform insights
   - User management interface

## 👨‍💻 Development

### Backend API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/test/questions` - Get learning test questions
- `POST /api/test/calculate` - Calculate learning profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/progress` - Update user progress
- `GET /api/users/analytics` - Get platform analytics (admin only)

### Frontend Structure

```
src/
├── components/
│   ├── Auth/                    # Login, Register
│   ├── Dashboard/               # Main dashboard
│   ├── LearningTest/            # Learning style assessment
│   ├── LearningCurveTest/       # Calibre test component
│   ├── SmartCaliberAssessment/  # Advanced AI assessment system
│   ├── StressRelief/            # Pomodoro, Breathing, Chatbot
│   ├── StudyMaterials/          # Personalized content delivery
│   ├── ProfileSection/          # User profile management
│   ├── LandingPage/             # Professional landing page
│   ├── Admin/                   # Analytics dashboard
│   └── Layout/                  # Navbar, Footer
├── context/                     # React Context (Auth)
├── utils/                       # API utilities
└── App.jsx                     # Main app component with routing
```

## 🎨 Design Features

- **Modern UI/UX** with gradient backgrounds and smooth animations
- **Responsive design** for desktop and mobile devices
- **Accessibility features** with proper ARIA labels and keyboard navigation
- **Dark mode friendly** color schemes
- **Smooth transitions** and hover effects

## 🚀 Deployment

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy with `git push heroku main`

### Frontend (Vercel/Netlify)
1. Build with `npm run build`
2. Deploy `dist/` folder

## 📊 Key Features for Demo

### 1. Personalization Engine
- Learning style classification algorithm
- Customized content recommendations
- Progress tracking and analytics

### 2. Stress Management Tools
- Evidence-based breathing exercises
- Productivity timer with notifications
- AI-powered study companion

### 3. Admin Insights
- User engagement analytics
- Learning style distribution
- Platform usage statistics

## 🎯 Future Enhancements

- **Advanced AI Integration** - Enhanced OpenAI and Google AI implementations
- **University Partnerships** - Campus-wide learning optimization systems
- **VR/AR Learning** - Immersive educational experiences
- **Blockchain Credentials** - Verified learning achievements and micro-certifications
- **Multi-language Support** - Localized content for international markets
- **IoT Integration** - Smart classroom environments with biometric monitoring
- **Mobile App Development** - Native iOS and Android applications
- **Study Group Collaboration** - AI-powered team formation and collaboration tools
- **Spaced Repetition Algorithms** - Advanced memory optimization techniques

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For hackathon demo questions or technical issues, please refer to the documentation above or create an issue in the repository.

---

**Built with ❤️ for student success and well-being**
