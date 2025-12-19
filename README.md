# User Authentication & Data Encryption System

This project handles **user authentication** and the **protection of sensitive personal data**. The core challenge was to build a system where sensitive fields (**specifically the Aadhaar/ID Number**) are **never stored in plain text** but are **securely encrypted at rest** and **only decrypted when requested by an authenticated user**.

---
## Technologies Used

- **Backend:** Django, Django Rest Framework, SimpleJWT, Cryptography
- **Frontend:** React, Vite, Axios
- **Database:** SQLite
- **Security:** AES-256 Encryption, JWT Authentication

--- 

## Implementation Approach & Core Logic

### 1. Backend Architecture (Django Rest Framework)

#### User Existence & Validation Logic

**Uniqueness Checks:**
The `User` model enforces `unique=True` on the **email** field. During registration, the `RegisterSerializer` automatically checks if the provided **username or email** already exists in the database. If a conflict is found, it raises a **validation error immediately**, preventing duplicate accounts.

**Password Validation:**
Enforces a **minimum password length of 8 characters** and checks that the **"Password"** and **"Confirm Password"** fields **match**.

![Screenshot 2025-12-19 131215](https://github.com/user-attachments/assets/5196be94-2ee2-48e1-bf1f-e7ca237c1382)

#### Security & Encryption Engine

**AES-256 Encryption:**
Implemented a custom `EncryptionHelper` class using the **cryptography** library. It generates a **random 16-byte Initialization Vector (IV)** for every encryption operation to ensure that the same Aadhaar number results in **different ciphertext every time** (protecting against **frequency analysis attacks**).

**Secure Storage:**
The Aadhaar number is received as **plain text**, **encrypted in memory**, and only the **Base64-encoded ciphertext** is saved to the **SQLite database**. The **plain text is never stored**.

![Screenshot 2025-12-19 131607](https://github.com/user-attachments/assets/4f9afc30-e752-4ce0-b9fd-a8deb1ff5a4e)

#### Authentication Flow

Implemented **stateless authentication** using **JWT (JSON Web Tokens)**.

**Login Logic:**
The system accepts an **email and password**, validates them against the **hashed password** in the database, and issues an **access token (short-lived)** and a **refresh token (long-lived)**.

![Screenshot 2025-12-19 131333](https://github.com/user-attachments/assets/bc8c533f-0cf1-412a-8e5b-33e9debf9649)

---

### 2. Frontend Architecture (React + Vite)

#### Modern UI/UX

Designed a **"Sliding Overlay" authentication interface** that combines **Login and Registration** into a **single, smooth user experience**.

![Screenshot 2025-12-19 133210](https://github.com/user-attachments/assets/337003ee-b664-497b-b4e1-6ec62dc2b63a)

![Screenshot 2025-12-19 133227](https://github.com/user-attachments/assets/d9e60f42-0213-4f73-ae6d-f199b3df232b)

#### Secure Dashboard

It fetches the **encrypted profile data**, which is **decrypted on-the-fly by the backend**, and displays the **sensitive Aadhaar number** **only to the authenticated user**.

![Screenshot 2025-12-19 131420](https://github.com/user-attachments/assets/36ba4275-eff7-4a38-9a08-d0fe0515910f)

---

## Setup & Run Instructions

Follow these step-by-step instructions to set up the project locally.

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.10, v3.11, or v3.12)  
  > **Note:** Python 3.14 is experimental and not supported by Django yet.

---

### 1. Backend Setup (Django)

The backend handles authentication, encryption, and database management.

#### Step 1: Navigate to the backend directory

Open your terminal and move to the server folder:

```bash
cd identity_service
```

#### Step 2: Create and Activate a Virtual Environment

It is recommended to run the backend in an isolated environment.

**Windows:**

```bash
python -m venv venv
.\venv\Scripts\activate
```

**Mac/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Dependencies

Install the required Python packages including Django, DRF, and Cryptography.

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers cryptography
```

*(Alternatively, if you have a `requirements.txt` file, run `pip install -r requirements.txt`)*

#### Step 4: Database Setup

Initialize the SQLite database and create the necessary tables.

```bash
python manage.py migrate
```

#### Step 5: Run the Server

Start the Django development server.

```bash
python manage.py makemigrations
python manage.py runserver
```

> The backend will start at: **http://127.0.0.1:8000/**

---

### 2. Frontend Setup (React + Vite)

The frontend provides the user interface for Login, Registration, and the Secure Dashboard.

#### Step 1: Navigate to the frontend directory

Open a **new terminal window** (keep the backend running) and move to the client folder:

```bash
cd frontend
```

#### Step 2: Install Node Modules

Download the necessary JavaScript libraries (React, Axios, etc.).

```bash
npm install
```

#### Step 3: Start the Development Server

Run the Vite server.

```bash
npm run dev
```

> The frontend will start at: **http://localhost:5173**

---

### 3. How to Use the Application

1. **Open the App:** Go to http://localhost:5173 in your browser.

2. **Register:** Click "Sign Up" to create a new account.
   - *Note:* The **Aadhaar Number** you enter here will be encrypted before saving.

3. **Login:** Use your registered Email and Password to log in.

4. **View Dashboard:** Upon successful login, you will see your profile.
   - The **Aadhaar Number** displayed here is decrypted in real-time by the backend.

5. **Verify Encryption (Admin Panel):**
   - Go to http://127.0.0.1:8000/admin
   - Log in (You may need to create a superuser first using `python manage.py createsuperuser`).
   - Inspect the `Users` table to see that the Aadhaar field is stored as **Encrypted Text** (gibberish), not plain text.

---

## Core API Endpoints

**Base URL:** `http://127.0.0.1:8000/api`

| Endpoint | Method | Auth Required | Request Body (JSON) | Description & Key Logic |
|----------|--------|---------------|---------------------|-------------------------|
| **1. Register**<br>`/register/` | `POST` | No | `email`, `username`, `password`, `first_name`, `last_name`, `aadhaar` | Creates a new user account.<br><br>**Key Logic:** The `aadhaar` field is intercepted by the serializer and **encrypted (AES-256)** before being stored in the database. |
| **2. Login**<br>`/login/` | `POST` | No | `email`, `password` | Authenticates the user.<br><br>**Response:** Returns an `access` token (short-lived) and a `refresh` token (long-lived). |
| **3. Get Profile**<br>`/profile/` | `GET` | **Yes**<br>(Bearer Token) | *None* | Fetches the current user's details.<br><br>**Key Logic:** Triggers the decryption process. The `aadhaar` number is decrypted on-the-fly and sent as plain text. |
| **4. Update Profile**<br>`/profile/update/` | `PATCH` | **Yes**<br>(Bearer Token) | `first_name`, `last_name`, `phone_number`, `address`, `date_of_birth` | Updates user details.<br><br>**Note:** Sensitive fields like `email`, `username`, and `password` are blocked from updates here for security. |
| **5. Refresh Token**<br>`/token/refresh/` | `POST` | No | `refresh` (The refresh token string) | Generates a new `access` token.<br><br>**Usage:** Called automatically by the frontend when it receives a `401 Unauthorized` error. |
| **6. Logout**<br>`/logout/` | `POST` | **Yes**<br>(Bearer Token) | `refresh_token` | Logs the user out server-side.<br><br>**Key Logic:** Adds the submitted refresh token to a "Blacklist," making it invalid for future use. |

---

### Diagram Explanation

This Entity-Relationship (ER) diagram visualizes how the system links user profiles with security tokens.

<img width="1433" height="777" alt="image" src="https://github.com/user-attachments/assets/8166f366-b0b3-4bf8-b965-57e39769a835" />


1. **Users Table (Yellow):**
This is the core table storing user identity.
* **Key Field:** `encrypted_aadhaar`. This field is highlighted because it stores the **ciphertext** (scrambled text) rather than the actual 12-digit number, ensuring security at rest.
* **Role:** Acts as the parent table that all other data is linked to.


2. **Outstanding Tokens (Blue):**
This table manages **Active Sessions**.
* **Relationship:** The line connecting it to `users` indicates a **One-to-Many** relationship. This means **one user** can have **multiple active tokens** (e.g., logged in on both a phone and a laptop at the same time).
* **Function:** It tracks every valid JWT token currently in circulation.


3. **Blacklisted Tokens (Red):**
This table manages **Secure Logout**.
* **Relationship:** It is linked directly to `outstanding_tokens`.
* **Function:** When a user clicks "Logout," their specific token ID is added here. The backend checks this table before every request; if a token appears here, access is denied immediately.

## License

This project is licensed under the MIT License.
