import { useCallback, useEffect, useRef } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('USE_WORKSPACE_DATA');

/**
 * Custom hook for managing workspace data initialization
 * @param {string} token - Authentication token
 * @param {Function} fetchWorkspaces - Workspace fetch function
 * @param {Function} fetchProjects - Project fetch function
 * @returns {object} - Initialization function
 */
const useWorkspaceData = (token, fetchWorkspaces, fetchProjects) => {
  const isMounted = useRef(false);

  const initializeData = useCallback(async () => {
    if (token) {
      try {
        logger.debug('Initializing workspace and project data');
        await Promise.all([fetchWorkspaces(), fetchProjects()]);
      } catch (error) {
        logger.error('Error initializing data:', error);
      }
    }
  }, [token, fetchWorkspaces, fetchProjects]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      logger.info('Initializing workspace data');
      initializeData();
    }

    return () => {
      if (isMounted.current) {
        logger.info('Cleaning up workspace data');
        isMounted.current = false;
      }
    };
  }, [initializeData]);

  return {
    initializeData
  };
};

export default useWorkspaceData;
