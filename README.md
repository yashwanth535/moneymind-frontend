# MoneyMind Frontend

A modern, responsive financial management web application built with React and Vite. MoneyMind provides an intuitive interface for managing personal finances, tracking transactions, setting budgets, and achieving financial goals.

## 🚀 Live Demo

**🌐 Deployed Application**: [https://moneymind.yashwanth.site/](https://moneymind.yashwanth.site/)

## ✨ Features

- **📊 Interactive Dashboard**: Real-time financial overview with charts and analytics
- **💰 Transaction Management**: Add, edit, and categorize financial transactions
- **📈 Financial Reports**: Detailed reports with Chart.js visualizations
- **🎯 Budget Tracking**: Create and monitor spending budgets
- **🎯 Goal Setting**: Set and track financial goals
- **👤 User Profiles**: Manage personal information and preferences
- **🔐 Secure Authentication**: JWT-based authentication with Google OAuth
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📄 PDF Export**: Generate and download financial reports as PDFs

## 🛠️ Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router DOM v7
- **Charts**: Chart.js for data visualization
- **Icons**: Lucide React & React Icons
- **Animations**: Framer Motion
- **Authentication**: Google OAuth integration
- **PDF Generation**: jsPDF with html2canvas
- **Development**: ESLint, PostCSS, Autoprefixer

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running (see backend README for setup)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, and other assets
│   ├── components/        # Reusable React components
│   │   ├── auth.jsx       # Authentication components
│   │   ├── Budget.jsx     # Budget management
│   │   ├── Dashboard.jsx  # Main dashboard
│   │   ├── Goals.jsx      # Goal tracking
│   │   ├── Profile.jsx    # User profile
│   │   ├── Reports.jsx    # Financial reports
│   │   ├── TransactionForm.jsx    # Transaction input
│   │   ├── TransactionList.jsx    # Transaction display
│   │   ├── ProtectedRoute.jsx     # Route protection
│   │   └── google.jsx     # Google OAuth integration
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Main application page
│   │   ├── Landing.jsx    # Landing page
│   │   └── error/         # Error pages
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.mjs     # PostCSS configuration
```

## 🎨 UI Components

### Core Features
- **Dashboard**: Financial overview with charts and key metrics
- **Transaction Management**: Add, edit, and categorize transactions
- **Budget Tracking**: Visual budget progress and spending alerts
- **Financial Reports**: Interactive charts and analytics
- **Goal Setting**: Progress tracking for financial goals
- **User Profile**: Account management and preferences

### Design System
- **Typography**: Custom font families (ABC Social, Merriweather, Roboto)
- **Color Scheme**: Light and dark mode support
- **Animations**: Custom keyframes and Framer Motion transitions
- **Grid System**: Responsive layout with Tailwind CSS
- **Icons**: Lucide React and React Icons library

## 🔌 API Integration

The frontend communicates with the MoneyMind backend API for:
- User authentication and authorization
- Transaction CRUD operations
- Budget management
- Financial reports generation
- Goal tracking
- Profile management

## 🚀 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎯 Key Features

### Authentication
- JWT-based authentication
- Google OAuth integration
- Protected routes
- Session management

### Dashboard
- Real-time financial overview
- Interactive charts and graphs
- Quick action buttons
- Recent transactions display

### Transaction Management
- Add new transactions with categories
- Edit existing transactions
- Filter and search functionality
- Bulk operations support

### Financial Reports
- Monthly/yearly spending analysis
- Category-wise breakdown
- Export to PDF functionality
- Interactive chart visualizations

### Budget Tracking
- Create multiple budgets
- Visual progress indicators
- Spending alerts
- Budget vs actual comparisons

### Goal Setting
- Set financial goals
- Track progress
- Milestone achievements
- Goal completion celebrations

## 🌙 Dark Mode

The application supports both light and dark themes with:
- Automatic theme detection
- Manual theme toggle
- Persistent theme preference
- Smooth transitions between themes

## 📱 Responsive Design

- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Mobile-first design with bottom navigation

## 🔒 Security Features

- Protected routes for authenticated users
- Secure API communication
- Input validation and sanitization
- XSS protection
- CSRF protection

## 🚀 Deployment

### Vercel Deployment
The project includes `vercel.json` configuration for easy deployment on Vercel.

### Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the backend API documentation

## 🔗 Related Links

- **Backend API**: [Backend Repository](../backend/README.md)
- **Live Demo**: [https://moneymind.yashwanth.site/](https://moneymind.yashwanth.site/)

---

**Note**: Make sure the backend API is running and properly configured before starting the frontend application.
