### 7. Step-by-Step Summary

1. **Create Workspace Schema & Model**
   - Fields: `name`, `owner`, `members` (with user & role).
   - Export a Mongoose model (e.g., `Workspace`).

2. **Implement Workspace Routes**
   - Create a new file, e.g. `workspaces.js` (or similar), importing `express.Router()` and the `auth` middleware.
   - Define `POST /workspaces`, `GET /workspaces`, `GET /workspaces/:id`, `PATCH /workspaces/:id`, and `DELETE /workspaces/:id`.

3. **Integrate Auth & Authorization**
   - In each route handler, retrieve the user from the JWT token (`req.userId`).
   - Validate if the user is the workspace owner or a member before returning or modifying data.

4. **Add the Routes to Your Express App**
   - In `app.js` (or wherever routes are registered), add something like:
     ```js
     const workspaceRoutes = require('./routes/workspaces');
     app.use('/workspaces', workspaceRoutes);
     ```

5. **Develop Unit & Integration Tests**
   - For the Workspace model: verify schema validations (e.g., required fields).
   - For routes:
     1. Create test users with valid JWT tokens.
     2. Test each endpoint for both success and failure scenarios.

6. **Prepare for Future Phases**
   - Keep the design flexible so you can add invitations, roles, and advanced membership logic.
   - For now, you do **not** need to implement invites or emailing. Just ensure you can add members directly if needed (or even skip that if you only want the owner in Phase 1).