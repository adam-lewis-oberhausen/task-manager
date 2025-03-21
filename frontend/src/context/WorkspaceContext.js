import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getWorkspaces } from '../services/workspaceService';
import { getProjects } from '../services/projectService';
import { createLogger } from '../utils/logger';
const logger = createLogger('WORKSPACE_CONTEXT');

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children, token }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState({
    workspaces: true,
    projects: true,
    tasks: false
  });
  const [error, setError] = useState({
    workspaces: null,
    projects: null,
    tasks: null
  });

  const fetchWorkspaces = useCallback(async () => {
    if (!token) {
      logger.warn('No authentication token available');
      setWorkspaces([]);
      setError('No authentication token');
      return;
    }

    try {
      logger.info('Fetching workspaces...');
      setLoading(true);
      setError(null);
      const data = await getWorkspaces(token);
      logger.debug('Workspaces retrieved:', data);
      setWorkspaces(data);
      if (data.length) {
        logger.debug('Setting initial workspace:', data[0]);
        setCurrentWorkspace(data[0]);
      } else {
        logger.info('No workspaces found');
      }
    } catch (err) {
      logger.error('Failed to fetch workspaces:', err);
      setError(err);
    } finally {
      logger.debug('Finished fetching workspaces');
      setLoading(false);
    }
  }, [token]);

  const fetchProjects = useCallback(async () => {
    if (currentWorkspace) {
      logger.info(`Fetching projects for workspace ${currentWorkspace._id}`);
      try {
        setLoading(true);
        setError(null);
        const data = await getProjects(currentWorkspace._id, token);
        logger.debug('Projects retrieved:', data);
        setProjects(data);
        if (data.length) {
          logger.debug('Setting initial project:', data[0]);
          setCurrentProject(data[0]);
        } else {
          logger.info('No projects found for workspace');
        }
      } catch (err) {
        logger.error('Failed to fetch projects:', err);
        setError(err);
      } finally {
        logger.debug('Finished fetching projects');
        setLoading(false);
      }
    } else {
      logger.debug('No current workspace selected');
    }
  }, [currentWorkspace, token]);

  // Initial load of workspaces
  useEffect(() => {
    logger.debug('Initial workspace load triggered');
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const prevWorkspace = useRef(null);

  // Load projects when workspace changes, but only if it's a different workspace
  useEffect(() => {
    if (currentWorkspace && (!prevWorkspace.current || 
        currentWorkspace._id !== prevWorkspace.current._id)) {
      logger.debug('Workspace changed, loading projects');
      fetchProjects();
      prevWorkspace.current = currentWorkspace;
    }
  }, [currentWorkspace, fetchProjects]);

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
