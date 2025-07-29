# Content Creating Site

A web application for users to create, share, and interact with content. Built with React, Firebase (Firestore, Auth, Storage), and supports user authentication, commenting, and liking features.

## Features

- User authentication (sign up, login, logout)
- Create, edit, and delete content
- Upload images and files
- Comment and like on posts
- User profiles
- Responsive design

## Technologies Used

- React
- Firebase (Firestore, Auth, Storage)
- CSS/Styled Components

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/Swastika45/ContentCreatingSite.git
   cd Content-Creating-Site
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Add your Firebase config to `.env`:
   ```
   REACT_APP_API_KEY=your_api_key
   REACT_APP_AUTH_DOMAIN=your_auth_domain
   REACT_APP_PROJECT_ID=your_project_id
   REACT_APP_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_APP_ID=your_app_id
   REACT_APP_MEASUREMENT_ID=your_measurement_id
   ```

4. Start the development server:
   ```
   npm start
   ```

## Folder Structure

- `/src` - React components and Firebase setup
- `/public` - Static files
- `.env` - Environment variables (not committed)
- `.gitignore` - Files and folders to ignore

## License

MIT
