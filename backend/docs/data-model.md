User
 ├─ email: String
 └─ password: String
       \
        \
Workspace
 ├─ name: String
 ├─ owner: UserId
 └─ members: [ { user: UserId, role: String } ]
       \
        \
Project
 ├─ name: String
 ├─ workspace: WorkspaceId
 └─ members: [ { user: UserId, role: String } ]
       \
        \
Task
 ├─ name: String
 ├─ description: String
 ├─ project: ProjectId
 ├─ createdBy: UserId
 ├─ assignedTo: UserId
 └─ followers: [UserId]
