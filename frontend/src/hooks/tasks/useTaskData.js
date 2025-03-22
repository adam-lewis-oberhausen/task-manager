import { useState, useEffect, useRef, useCallback } from 'react';
import { getTasks } from '../../services/taskService';
import { MOCK_TASKS, normalizeTask } from '../../utils/taskHelpers';
import { createLogger } from '../../utils/logger';

const logger = createLogger('USE_TASK_DATA');

const useTaskData = (token, projectId) => {
  const [tasks, setTasks] = useState([]);
  const isMounted = useRef(false);
  const prevToken = useRef(token);

  const loadMockTasks = useCallback(() => {
    const normalizedTasks = MOCK_TASKS.map(normalizeTask);
    logger.debug('Loading mock tasks:', normalizedTasks);
    setTasks(prevTasks => {
      const filteredTasks = prevTasks.filter(t => !t._id.startsWith('mock-'));
      return [...filteredTasks, ...normalizedTasks];
    });
  }, []);

  const fetchTasks = useCallback(async (force = false) => {
    try {
      if (!isMounted.current || !projectId) return;
      if (!force && tasks.length > 0) return;

      const timeoutId = setTimeout(async () => {
        try {
          const tasks = await getTasks(token, projectId);
          if (tasks.length === 0) {
            loadMockTasks();
          } else {
            setTasks(tasks);
          }
          prevToken.current = token;
        } catch (error) {
          logger.error('Error fetching tasks:', error);
          loadMockTasks();
        }
      }, 200);

      return timeoutId;
    } catch (error) {
      logger.error('Error in fetchTasks:', error);
    }
  }, [token, projectId, tasks.length, loadMockTasks]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let timeoutId;
    if (token) {
      timeoutId = fetchTasks();
    } else {
      loadMockTasks();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [token, fetchTasks, loadMockTasks, projectId]);

  return {
    tasks,
    setTasks,
    fetchTasks,
    loadMockTasks
  };
};

export default useTaskData;
