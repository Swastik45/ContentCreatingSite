# 📚 Content Creating Site

A full-stack web application where users can create, share, and interact with content. Built using **React** and **Firebase** (Firestore, Auth, Storage). Features include user authentication, content management, media uploads, user interactions (likes, comments), and responsive design.

🔗 **[Live Demo](https://protfolio-542a8.web.app/)**



## ✨ Features

* 🔐 User Authentication (Sign Up, Login, Logout)
* ✍️ Create, Edit, and Delete Posts
* 📷 Upload Images and Files
* 💬 Comment and Like on Posts
* 👤 User Profiles
* 📱 Responsive Design (Mobile + Desktop)



## 🛠️ Technologies Used

* **Frontend**: React, CSS / Styled Components
* **Backend & Hosting**: Firebase (Firestore, Authentication, Storage, Hosting)



## 🚀 Getting Started

Follow these steps to run the project locally:

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



## 📁 Folder Structure

```
ContentCreatingSite/
├── /public              # Static files
├── /src                 # React components & Firebase setup
├── .env                 # Environment variables (not committed)
├── .gitignore           # Ignored files and folders
├── package.json         # Project metadata and scripts
└── README.md            # Project documentation
```



## 🖼️ Screenshots

![Screenshot 1](https://github.com/user-attachments/assets/d9a41d15-f789-4062-8df0-17efafcf4d1b)

![Screenshot 2](https://github.com/user-attachments/assets/f80ac0a8-2dd0-4ec8-a785-b891c69d3f0e)



## 📄 License

This project is licensed under the [MIT License](LICENSE).
