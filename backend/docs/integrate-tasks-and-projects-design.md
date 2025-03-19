# Phase 2 Implementation Plan: Integrate Tasks with Projects

This document outlines the approach for **Phase 2** of our Task Manager backend, focusing on integrating Tasks with Projects. The goal is to ensure that each task belongs to a project and that only authorized users can manage tasks within those projects. Below is a detailed plan for data modeling, routes, business logic, and unit testing.

---

## 1. Objectives

1. **Create a new `Project` model** (or extend it if you already have one in mind).
2. **Add a `project` field** to the `Task` model, referencing the Project it belongs to.
3. **Update Task endpoints** to ensure tasks are always associated with a valid project.
4. **Restrict task operations** so that only project members (or workspace members) can create, read, update, or delete tasks in that project.
5. **Write unit tests** to verify all new backend operations and validations.

---

## 2. Project Model

### 2.1 Fields

- **`name`**: `String`, required
- **`workspace`**: `ObjectId`, references the `Workspace`, required
- **`members`**: (Optional for Phase 2)
  - If you want per-project membership: `[ { user: ObjectId, role: String } ]`
  - Otherwise, rely on workspace membership at this stage.

**Example (pseudocode)**:
```js
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  // Optional: members array to restrict who can view or modify tasks in this project
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, default: 'member' }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
