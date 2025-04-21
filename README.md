# Foodie

A community-driven platform for sharing and discovering authentic Sierra Leonean recipes.

![recipe](https://github.com/user-attachments/assets/bb03a0ef-c38a-42fc-b47f-105b6512f9a7)

## Description

Foodie is a web application built with React and Firebase, dedicated to preserving and sharing the rich culinary heritage of Sierra Leone. Users can explore traditional recipes, submit their own family favorites, and connect with a community of food lovers. The platform features a community validation system where members can vote on the authenticity and accuracy of recipes.

## Features and Functionality

*   **Recipe Discovery:** Browse a wide range of Sierra Leonean recipes, from everyday staples to special occasion dishes.
*   **User Authentication:** Secure user registration and login using Firebase Authentication.
*   **Recipe Submission:** Registered users can submit their own recipes with detailed ingredients, instructions, and images.
*   **Community Validation:** Users can vote on recipes to validate their authenticity and accuracy. Recipes with a 70% or higher approval rating are featured.
*   **User Profiles:** Users have profiles where they can manage their account information, view their submitted recipes, and update their password.
*   **Search and Filtering:** Easily find recipes using search and filtering options based on keywords, categories, cooking time, servings, and approval rating.
*   **Responsive Design:** The application is designed to be responsive and accessible on various devices.
*   **Image Upload:** Users can upload images for their recipes using Firebase Storage.
*   **Commenting:** Users can comment on recipes to share their thoughts and feedback.

## Technology Stack

*   **Frontend:**
    *   React: A JavaScript library for building user interfaces.
    *   React Router: A standard library for routing in React.
    *   TypeScript: A superset of JavaScript that adds static typing.
    *   Tailwind CSS: A utility-first CSS framework for rapid UI development.
    *   Shadcn UI: A Tailwind css UI Library.
    *   Lucide React: A collection of beautiful, consistent icons.
*   **Backend:**
    *   Firebase: A platform developed by Google for creating mobile and web applications.
        *   Firebase Authentication: For user authentication.
        *   Firebase Firestore: A NoSQL document database for storing recipes, user profiles, and other data.
        *   Firebase Storage: For storing recipe images.
*   **Build Tool:**
    *   Vite: A build tool that aims to provide a faster and leaner development experience for modern web projects.

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (version 18 or higher)
*   npm or yarn package manager
*   Firebase project set up and configured

## Installation Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Melo034/foodie.git
    cd foodie
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Firebase:**

    *   Create a `.env` file in the root directory of the project.
    *   Add your Firebase project credentials to the `.env` file.  These values should match the `firebaseConfig` object found in `src/server/firebase.ts`.

    ```
    VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
    ```

4.  **Start the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    This will start the development server at `http://localhost:port_number`.

## Usage Guide

1.  **Access the application:**

    *   Open your web browser and navigate to `http://localhost:port_number`.

2.  **Explore Recipes:**

    *   Browse the homepage (`/`) to discover featured and popular recipes.
    *   Visit the recipes page (`/recipes`) to view all community recipes.
    *   Use the search bar and filters to find specific recipes.
    *   Click on a recipe card to view detailed information, including ingredients, instructions, and community ratings.

3.  **User Authentication:**

    *   Click the "Sign Up" button on the homepage or visit `/auth/signup` to create an account.
    *   Click the "Login" button on the homepage or visit `/auth/login` to log in to your account.

4.  **Submit a Recipe:**

    *   Log in to your account.
    *   Click the "Submit a Recipe" button on the homepage or visit `/submit-recipe`.
    *   Fill out the recipe submission form with detailed information.
    *   Upload an image of your recipe.
    *   Click the "Submit Recipe" button to submit your recipe.

5.  **Manage Your Profile:**

    *   Log in to your account.
    *   Click on your profile icon in the navbar and select "Profile" to manage your account information.
    *   Update your name, email, bio, and avatar.
    *   Change your password in the "Security" settings.
    *   View and manage your submitted recipes in the "My Recipes" section.


## License Information

This project is open source and available under the [MIT License](LICENSE).

## Contact/Support Information

For questions, support, or feedback, please contact:

*   [kanujosephmelvin@gmail.com](mailto:kanujosephmelvin@gmail.com)
*   [https://github.com/Melo034/foodie](https://github.com/Melo034/foodie)
