
---

This project handles **user authentication** and the **protection of sensitive personal data**. The core challenge was to build a system where sensitive fields (**specifically the Aadhaar/ID Number**) are **never stored in plain text** but are **securely encrypted at rest** and **only decrypted when requested by an authenticated user**.

---

## **Implementation Approach & Core Logic**

### **1. Backend Architecture (Django Rest Framework)**

#### **User Existence & Validation Logic**

* **Uniqueness Checks**:
  The `User` model enforces `unique=True` on the **email** field. During registration, the `RegisterSerializer` automatically checks if the provided **username or email** already exists in the database. If a conflict is found, it raises a **validation error immediately**, preventing duplicate accounts.

* **Password Validation**:
  Enforces a **minimum password length of 8 characters** and checks that the **"Password"** and **"Confirm Password"** fields **match**.

<img width="1919" height="982" alt="Screenshot 2025-12-19 131215" src="https://github.com/user-attachments/assets/5196be94-2ee2-48e1-bf1f-e7ca237c1382" />


## **Security & Encryption Engine**

* **AES-256 Encryption**:
  Implemented a custom `EncryptionHelper` class using the **cryptography** library. It generates a **random 16-byte Initialization Vector (IV)** for every encryption operation to ensure that the same Aadhaar number results in **different ciphertext every time** (protecting against **frequency analysis attacks**).

* **Secure Storage**:
  The Aadhaar number is received as **plain text**, **encrypted in memory**, and only the **Base64-encoded ciphertext** is saved to the **SQLite database**. The **plain text is never stored**.
<img width="1428" height="803" alt="Screenshot 2025-12-19 131607" src="https://github.com/user-attachments/assets/4f9afc30-e752-4ce0-b9fd-a8deb1ff5a4e" />


## **Authentication Flow**

* Implemented **stateless authentication** using **JWT (JSON Web Tokens)**.

* **Login Logic**:
  The system accepts an **email and password**, validates them against the **hashed password** in the database, and issues an **access token (short-lived)** and a **refresh token (long-lived)**.
<img width="1891" height="975" alt="Screenshot 2025-12-19 131333" src="https://github.com/user-attachments/assets/bc8c533f-0cf1-412a-8e5b-33e9debf9649" />



## **2. Frontend Architecture (React + Vite)**

### **Modern UI/UX**

* Designed a **"Sliding Overlay" authentication interface** that combines **Login and Registration** into a **single, smooth user experience**.
<img width="1901" height="1023" alt="Screenshot 2025-12-19 133210" src="https://github.com/user-attachments/assets/337003ee-b664-497b-b4e1-6ec62dc2b63a" />
<img width="1897" height="1045" alt="Screenshot 2025-12-19 133227" src="https://github.com/user-attachments/assets/d9e60f42-0213-4f73-ae6d-f199b3df232b" />


### **Secure Dashboard**

* It fetches the **encrypted profile data**, which is **decrypted on-the-fly by the backend**, and displays the **sensitive Aadhaar number** **only to the authenticated user**.
<img width="1915" height="998" alt="Screenshot 2025-12-19 131420" src="https://github.com/user-attachments/assets/36ba4275-eff7-4a38-9a08-d0fe0515910f" />


---
Setup & Run Instructions

Follow these step-by-step instructions to set up the project locally.

## Prerequisites
* **Node.js** (v16 or higher)
* **Python** (v3.10, v3.11, or v3.12)  
  *> **Note:** Python 3.14 is experimental and not supported by Django yet.*

---

## 1. Backend Setup (Django)

The backend handles authentication, encryption, and database management.

### Step 1: Navigate to the backend directory
Open your terminal and move to the server folder:
```bash
cd identity_service

```

### Step 2: Create and Activate a Virtual Environment

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

### Step 3: Install Dependencies

Install the required Python packages including Django, DRF, and Cryptography.

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers cryptography

```

*(Alternatively,  `requirements.txt` file, run `pip install -r requirements.txt`)*

### Step 4: Database Setup

Initialize the SQLite database and create the necessary tables.

```bash
python manage.py migrate

```

### Step 5: Run the Server

Start the Django development server.

```bash
thon manage.py makemigrations
python manage.py runserver

```

> The backend will start at: **http://127.0.0.1:8000/**

---

## 2. Frontend Setup (React + Vite)

The frontend provides the user interface for Login, Registration, and the Secure Dashboard.

### Step 1: Navigate to the frontend directory

Open a **new terminal window** (keep the backend running) and move to the client folder:

```bash
cd frontend

```

### Step 2: Install Node Modules

Download the necessary JavaScript libraries (React, Axios, etc.).

```bash
npm install

```

### Step 3: Start the Development Server

Run the Vite server.

```bash
npm run dev

```

> The frontend will start at: **http://localhost:5173**

---

## 3. How to Use the Application

1. **Open the App:** Go to [http://localhost:5173] in your browser.
2. **Register:** Click "Sign Up" to create a new account.
* *Note:* The **Aadhaar Number** you enter here will be encrypted before saving.


3. **Login:** Use your registered Email and Password to log in.
4. **View Dashboard:** Upon successful login, you will see your profile.
* The **Aadhaar Number** displayed here is decrypted in real-time by the backend.


5. **Verify Encryption (Admin Panel):**
* Go to [http://127.0.0.1:8000/admin](https://www.google.com/search?q=http://127.0.0.1:8000/admin)
* Log in (You may need to create a superuser first using `python manage.py createsuperuser`).
* Inspect the `Users` table to see that the Aadhaar field is stored as **Encrypted Text** (gibberish), not plain text.



```

```



