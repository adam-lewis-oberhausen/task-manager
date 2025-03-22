task-manager/
├── backend/
│   ├── middleware/
│   │   └── projectAccess.js
│   ├── models/
│   │   └── User.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── projects.test.js
│   │   ├── tasks.test.js
│   │   └── workspaces.test.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── __tests__/
│   │   │   └── example.test.js
│   │   ├── assets/
│   │   │   ├── delete.svg
│   │   │   ├── drag-handle.svg
│   │   │   └── edit.svg
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthError.js
│   │   │   │   ├── AuthLink.js
│   │   │   │   ├── LoginForm.js
│   │   │   │   └── RegisterForm.js
│   │   │   ├── tasks/
│   │   │   │   ├── TaskForm.js
│   │   │   │   ├── TaskPanel.js
│   │   │   │   ├── TaskRow.js
│   │   │   │   ├── TaskTableHeader.js
│   │   │   │   └── __tests__/
│   │   │   │       └── TaskRow.test.js
│   │   │   ├── ui/
│   │   │   │   ├── Button.js
│   │   │   │   ├── Checkbox.js
│   │   │   │   ├── Form.js
│   │   │   │   ├── Input.js
│   │   │   │   ├── Navbar.js
│   │   │   │   └── Table.js
│   │   │   ├── App.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── context/
│   │   ├── hooks/
│   │   │   ├── auth/
│   │   │   │   ├── useAuth.js
│   │   │   │   ├── useLoginForm.js
│   │   │   │   └── useRegisterForm.js
│   │   │   ├── tasks/
│   │   │   │   ├── useTaskCallbacks.js
│   │   │   │   ├── useTaskForm.js
│   │   │   │   ├── useTaskPanel.js
│   │   │   │   └── useTaskRow.js
│   │   │   └── useWorkspaceData.js
│   │   ├── mocks/
│   │   │   ├── handlers.js
│   │   │   └── server.js
│   │   ├── services/
│   │   │   └── taskService.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── taskHelpers.js
│   │   ├── setupTests.js
│   │   └── index.js
│   ├── docs/
│   │   ├── DEVELOPMENT_PRINCIPLES.md
│   │   └── TESTING.md
│   ├── package.json
│   └── README.md
└── README.md  