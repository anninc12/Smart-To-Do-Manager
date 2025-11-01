# 🧩 Smart To-Do Manager

A full-stack task management web application that allows users to **create, manage, and organize tasks efficiently**.
The app helps users stay productive with **priority management**, **deadlines**, and **overdue alerts**, all built using the MongoDB, Express.js,Node.js.

---

## 🚀 Features

✅ **User Authentication**

* Secure registration, login, and password reset using MongoDB and Express.

✅ **CRUD Operations**

* Create, Read, Update, and Delete tasks seamlessly.

✅ **Priority & Deadline Management**

* Set task priority (High / Medium / Low) and assign due dates.

✅ **Overdue Task Highlighting**

* Automatically mark tasks that have passed their due date.

✅ **Search & Filtering**

* Quickly find tasks by title, category, or priority.

✅ **Responsive UI**

* Works smoothly on desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

| Category            | Technology Used                   |
| ------------------- | --------------------------------- |
| **Frontend**        | HTML, CSS (Bootstrap), JavaScript |
| **Backend**         | Node.js, Express.js               |
| **Database**        | MongoDB (Mongoose ODM)            |
| **Version Control** | Git & GitHub                      |
| **Tools**           | VS Code, Postman                  |

---

## 🗃️ Database Structure

### Database Name: `smarttodo`

**Collections:**

1. **users**

   * Fields: `_id`, `name`, `email`, `password`, `createdAt`

2. **tasks**

   * Fields: `_id`, `title`, `description`, `category`, `priority`, `status`, `dueDate`, `createdAt`, `userId`

3. **password_reset**

   * Fields: `_id`, `email`, `oldPassword`, `newPassword`, `resetAt`

---

## ⚙️ Installation & Setup

1. **Clone this repository**

   ```bash
   git clone https://github.com/anninc12/Smart-To-Do-Manager.git
   cd Smart-To-Do-Manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root folder and add:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_secret_key
   ```

4. **Run the application**

   ```bash
   npm start
   ```

5. **Access the app**
   Open your browser and go to:
   👉 `http://localhost:5000`

---

## 📸 Screenshots

\Assests\Outputs\Home.jpeg
\Assests\Outputs\Features.jpeg
\Assests\Outputs\About.jpeg
\Assests\Outputs\Login.jpeg
\Assests\Outputs\Register.jpeg
\Assests\Outputs\DashBoard.jpeg
\Assests\Outputs\Add-Task.jpeg
\Assests\Outputs\Edit-Task.jpeg
\Assests\Outputs\All Tasks.jpeg



## 👩‍💻 Developer

**Name:** Annin C
**Course:** MCA
**Role:** Full Stack Developer (Frontend & Backend Integration)
**GitHub:** [anninc12](https://github.com/anninc12)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🧠 Future Enhancements

* Add email notifications for overdue tasks.
* Enable task sharing between users.
* Add dark mode and drag-drop task sorting.

---

⭐ **If you like this project, don’t forget to give it a star on GitHub!**
