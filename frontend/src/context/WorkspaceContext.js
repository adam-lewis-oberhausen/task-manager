import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getWorkspaces } from '../services/workspaceService';
import { getProjects } from '../services/projectService';

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children, token }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkspaces(token);
      setWorkspaces(data);
      if (data.length) {
        setCurrentWorkspace(data[0]);
      }
    } catch (err) {
      setError(err);
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchProjects = useCallback(async () => {
    if (currentWorkspace) {
      try {
        setLoading(true);
        setError(null);
        const data = await getProjects(currentWorkspace._id, token);
        setProjects(data);
        if (data.length) {
          setCurrentProject(data[0]);
        }
      } catch (err) {
        setError(err);
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [currentWorkspace, token]);

  // Initial load of workspaces
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Load projects when workspace changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Context value
  const contextValue = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    projects,
    currentProject,
    setCurrentProject,
    loading,
    error,
    refreshWorkspaces: fetchWorkspaces,
    refreshProjects: fetchProjects
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
