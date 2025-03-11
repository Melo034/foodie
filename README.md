# Foodie

This is a web application built with React and Firebase that serves as a directory for Recipes in  Sierra Leone. It provides key information about recipes and allows users to submit and vote on recipes Authenticity. The application uses Firebase for data storage and management.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Firebase SDK**: Used for backend services such as Firestore for data storage.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **React Router**: For navigation within the application.

## Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Melo034/foodie.git
   cd foodie

2. **Install Dependencies**:

   ```bash
   npm install
   # OR
   yarn install

2. **Set up Firebase**:

- Go to the Firebase Console and create a new project.
- Enable the necessary services (e.g., Firestore).
- Obtain your Firebase configuration object from the Firebase Console.
- Create a .env file in the root of the project and add your Firebase config as follows

  ```bash
  VITE_API_KEY=your_firebase_api_key
  VITE_AUTH_DOMAIN=your_firebase_auth_domain
  VITE_PROJECT_ID=your_firebase_project_id
  VITE_STORAGE_BUCKET=your_firebase_storage_bucket
  VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
  VITE_APP_ID=your_firebase_app_id

3. **Run the server**:
   ```bash
   npm run dev
   # OR
   yarn run dev
