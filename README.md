# 📚 Content Creating Site

A full-stack web application where users can create, share, and interact with content. Built using **React** and **Firebase** (Firestore, Auth, Storage). Features include user authentication, content management, media uploads, user interactions (likes, comments, replies), and responsive design.

🔗 **[Live Demo]( https://content-creating-platform.web.app   )**

## ✨ Features

* 🔐 **User Authentication** (Sign Up, Login, Logout)
* ✍️ **Create, Edit, and Delete Posts**
* 📷 **Upload Images and Files**
* 💬 **Enhanced Comment System**
  * Add, edit, and delete comments
  * Reply to comments
  * Like/unlike comments
  * Real-time updates
* 👤 **User Profiles**
* 📱 **Responsive Design** (Mobile + Desktop)
* 🎨 **Rich Text Editor**
* 🔍 **Search and Filter Content**
* 📊 **Real-time Updates**
* 🔔 **Toast Notifications**

## 🛠️ Technologies Used

### Frontend
* **React 18.3.1** - UI Framework
* **React Router 7.0.1** - Client-side routing
* **Tailwind CSS 3.4.15** - Utility-first CSS framework
* **Framer Motion** - Animation library
* **React Icons** - Icon library
* **React Toastify** - Toast notifications

### Backend & Hosting
* **Firebase Authentication** - User management
* **Cloud Firestore** - NoSQL database
  * Custom security rules for comments, replies, and likes
  * Real-time data synchronization
* **Firebase Storage** - File storage
* **Firebase Hosting** - Static hosting

### Development Tools
* **React App Rewired** - Custom webpack configuration
* **PostCSS** - CSS processing
* **Autoprefixer** - CSS vendor prefixes

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Swastik45/ContentCreatingSite.git
   cd ContentCreatingSite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the root directory and add your Firebase config:
   ```env
   REACT_APP_API_KEY=your_api_key
   REACT_APP_AUTH_DOMAIN=your_auth_domain
   REACT_APP_PROJECT_ID=your_project_id
   REACT_APP_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_APP_ID=your_app_id
   REACT_APP_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
ContentCreatingSite/
├── /public              # Static files and assets
│   ├── favicon.ico      # App icon
│   ├── index.html       # Main HTML template
│   └── robots.txt       # SEO robots file
├── /src                 # React application source
│   ├── /components      # Reusable UI components
│   │   ├── Auth.js      # Authentication forms
│   │   ├── CreateContent.js # Content creation interface
│   │   ├── HomePage.js  # Landing page
│   │   ├── MyContent.js # User's content management
│   │   ├── Navbar.js    # Navigation component
│   │   ├── Profile.js   # User profile page
│   │   └── PublicContent.js # Public content feed
│   ├── App.js           # Main application component
│   ├── firebase.js      # Firebase configuration
│   ├── index.js         # Application entry point
│   └── tailwind.css     # Tailwind CSS imports
├── /config-overrides.js # Webpack configuration overrides
├── .env                 # Environment variables (not committed)
├── .gitignore          # Git ignore rules
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md          # Project documentation
```

## 🎯 Key Components

### Authentication System
- **Sign Up**: New user registration with email verification
- **Login**: Secure user authentication
- **Protected Routes**: Route guards for authenticated users
- **User Context**: Global user state management

### Content Management
- **Create Content**: Rich text editor with media support
- **Edit Content**: In-place content editing
- **Delete Content**: Soft delete with confirmation
- **Media Upload**: Image and file upload to Firebase Storage

### User Interactions
- **Like System**: Toggle likes on content
- **Comments**: Nested comment threads
- **User Profiles**: Customizable user profiles
- **Follow System**: Follow/unfollow creators

### Responsive Design
- **Mobile-first approach**
- **Tailwind CSS breakpoints**
- **Touch-friendly interfaces**
- **Optimized images**

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🚀 Deployment

### Firebase Hosting
1. Install Firebase CLI
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase
   ```bash
   firebase login
   ```
3. Initialize Firebase in your project
   ```bash
   firebase init
   ```
4. Deploy to Firebase
   ```bash
   npm run build && firebase deploy
   ```

### Environment Variables
Make sure to set up your environment variables in Firebase Hosting:
- Go to Firebase Console → Hosting → Environment Variables
- Add all variables from your `.env` file

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase configuration errors**
   - Ensure all environment variables are correctly set
   - Check Firebase project permissions

2. **Build failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

3. **CORS issues**
   - Configure Firebase Storage CORS settings
   - Check Firebase Authentication settings

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 👤 Author

**Swastik45** - Initial work - [Swastik45](https://github.com/Swastik45)

## 🙏 Acknowledgments

- React community for excellent documentation
- Firebase team for robust backend services
- Tailwind CSS for utility-first approach
- All contributors and supporters

## 📞 Support

For support, email psamarpaudel@gmail.com or join our Slack channel.
