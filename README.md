# Task Manager

This Task Manager application is a full-stack project designed to help users manage their tasks efficiently. It includes features such as task prioritization, due dates, completion status, and drag-and-drop reordering. The application is built with a React frontend and a Node.js/Express backend.

## Features

- **Task Prioritization**: Add a priority field to tasks (High, Medium, Low) and sort tasks by priority.
- **Due Dates**: Set and display due dates for tasks, with overdue tasks highlighted.
- **Completion Status**: Mark tasks as complete or incomplete and filter tasks by completion status.
- **Drag-and-Drop**: Reorder tasks using drag-and-drop functionality.
- **User Authentication**: Implement user authentication and authorization using JWT.
- **Search and Filter**: Search tasks by title or description and filter by priority, due date, or completion status.
- **Task Comments**: Add and display comments for each task.
- **Responsive Design**: Mobile-friendly and responsive layout.

## Backend Setup

The backend is built with Node.js and Express, providing a RESTful API for managing tasks. It includes endpoints for creating, updating, deleting, and fetching tasks. User authentication is implemented using JWT.

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:

   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`.

## Frontend Setup

The frontend is built with React and Material-UI, providing a user-friendly interface for managing tasks. It includes components for task lists, forms, and drag-and-drop functionality.

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the frontend development server:

   ```bash
   npm start
   ```

   The application will run on `http://localhost:3000`.

## Running the Project Locally

1. Ensure both the backend and frontend servers are running as described above.
2. Open your web browser and navigate to `http://localhost:3000` to access the Task Manager application.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.
