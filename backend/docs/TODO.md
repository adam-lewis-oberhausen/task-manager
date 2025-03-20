# Add Workspace/Project Context to the Frontend

## 4.1 Create a WorkspaceContext or Combined Context

In `frontend/src/context/WorkspaceContext.js` (or a similarly named file), you can create a React context that loads:

- All workspaces for the current user
- The currently selected workspace
- All projects in that workspace
- The currently selected project

### Minimal example:

```jsx
// WorkspaceContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getUserWorkspaces } from '../services/workspaceService';
import { getWorkspaceProjects } from '../services/projectService';

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children, token }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    async function fetchWorkspaces() {
      const data = await getUserWorkspaces(token);
      setWorkspaces(data);
      // Optionally select the first workspace as default
      if (data.length) {
        setCurrentWorkspace(data[0]);
      }
    }
    fetchWorkspaces();
  }, [token]);

  // Whenever the current workspace changes, load its projects
  useEffect(() => {
    async function fetchProjects() {
      if (currentWorkspace) {
        const data = await getWorkspaceProjects(currentWorkspace._id, token);
        setProjects(data);
        // Optionally select the first project as default
        if (data.length) {
          setCurrentProject(data[0]);
        }
      }
    }
    fetchProjects();
  }, [currentWorkspace, token]);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      currentWorkspace,
      setCurrentWorkspace,
      projects,
      currentProject,
      setCurrentProject,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
```

**Note:** Adjust for how you actually get `token`. Typically, you might pass it in or read from `localStorage`.

## 4.2 Wrap Your `<App />` with `<WorkspaceProvider>`

Open `frontend/src/App.js` and update it as follows:

```jsx
import React, { useState } from 'react';
import { WorkspaceProvider } from './context/WorkspaceContext';

function App() {
  const [token, setToken] = useState(...);

  return (
    <WorkspaceProvider token={token}>
      {/* Your existing code */}
    </WorkspaceProvider>
  );
}

export default App;
```

## 4.3 Create `WorkspaceSelector.js` & `ProjectSelector.js`

### `WorkspaceSelector.js`
A simple dropdown that displays all user workspaces (provided by `WorkspaceContext`), and sets the chosen one as `currentWorkspace`.

```jsx
import React, { useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';

function WorkspaceSelector() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useContext(WorkspaceContext);

  return (
    <select
      value={currentWorkspace?._id || ''}
      onChange={(e) => {
        const selectedWs = workspaces.find(ws => ws._id === e.target.value);
        setCurrentWorkspace(selectedWs);
      }}
    >
      {workspaces.map(ws => (
        <option key={ws._id} value={ws._id}>
          {ws.name}
        </option>
      ))}
    </select>
  );
}

export default WorkspaceSelector;
```

### `ProjectSelector.js`
A similar dropdown for selecting projects inside the `currentWorkspace`.

```jsx
import React, { useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';

function ProjectSelector() {
  const { projects, currentProject, setCurrentProject } = useContext(WorkspaceContext);

  return (
    <select
      value={currentProject?._id || ''}
      onChange={(e) => {
        const selectedProject = projects.find(p => p._id === e.target.value);
        setCurrentProject(selectedProject);
      }}
    >
      {projects.map(p => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export default ProjectSelector;
```

### Integrating the Selectors
Within your main UI (`App.js` or a common layout), render:

```jsx
<WorkspaceSelector />
<ProjectSelector />
```

