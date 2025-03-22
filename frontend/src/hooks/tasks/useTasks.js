import { useState, useEffect, useCallback, useRef } from 'react';
import { getTasks, deleteTask, updateTask, createTask } from '../../services/taskService';
import { MOCK_TASKS, normalizeTask } from '../../utils/taskHelpers';
import { createLogger } from '../../utils/logger';
const logger = createLogger('USE_TASKS');

export const useTasks = (token, projectId) => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const loadMockTasks = useCallback(() => {
    const normalizedTasks = MOCK_TASKS.map(normalizeTask);
    logger.debug('Loading mock tasks:', normalizedTasks);
    // Single state update for all mock tasks
    setTasks(prevTasks => {
      // Remove any existing mock tasks
      const filteredTasks = prevTasks.filter(t => !t._id.startsWith('mock-'));
      return [...filteredTasks, ...normalizedTasks];
    });
  }, []);

  const isMounted = useRef(false);
  const prevToken = useRef(token);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!isMounted.current || !projectId) return;

        // Add small debounce to prevent rapid refetches
        const timeoutId = setTimeout(async () => {
          try {
            logger.info('Fetching tasks for project:', projectId);
            const tasks = await getTasks(token, projectId);
            logger.debug('Tasks retrieved:', tasks);
            logger.debug('Number of tasks:', tasks.length);

            if (tasks.length === 0) {
              logger.info('No tasks found, loading mock tasks');
              loadMockTasks();
            } else {
              logger.debug('Setting tasks:', tasks);
              setTasks(tasks);
            }
            prevToken.current = token;
          } catch (error) {
            logger.error('Error fetching tasks:', error);
            // If there's an error fetching tasks, load mock tasks as fallback
            logger.info('Error fetching tasks, loading mock tasks as fallback');
            loadMockTasks();
          }
        }, 200); // 200ms debounce

        return timeoutId;
      } catch (error) {
        logger.error('Error in fetchTasks:', error);
      }
    };

    // Only fetch tasks if we have a valid token
    let timeoutId;
    if (token) {
      timeoutId = fetchTasks();
    } else {
      // If no token, load mock tasks
      logger.info('No token available, loading mock tasks');
      loadMockTasks();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [token, loadMockTasks, projectId]);

  const handleDelete = useCallback(async (id) => {
    try {
      logger.info('Deleting task with id:', id);

      // Optimistically remove the task from UI
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));

      // Only call deleteTask for non-mock tasks
      if (!id.startsWith('mock-')) {
        logger.debug('Deleting real task');
        await deleteTask(id);
      } else {
        logger.debug('Deleting mock task');
      }

      // Check if we need to load mock tasks
      setTasks(prevTasks => {
        if (prevTasks.length === 0) {
          logger.info('Deleted all tasks, loading mock tasks');
          loadMockTasks();
        }
        return prevTasks;
      });
    } catch (error) {
      logger.error('Error deleting task:', error);
    }
  }, [tasks, loadMockTasks]);



  const toggleCompletion = useCallback(async (task) => {
    try {
      logger.debug('Toggling completion for task:', task._id);
      const updatedTask = { ...task, completed: !task.completed };
      logger.debug('Updated task state:', updatedTask);
      await updateTask(task._id, updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t._id === task._id ? updatedTask : t
        )
      );
    } catch (error) {
      logger.error('Error toggling task completion:', error);
    }
  }, []);

  const handleTaskUpdate = useCallback(async (taskData) => {
    try {
      logger.debug('Handling task update for:', taskData);

      // Prepare task data
      const taskToCreate = {
        name: taskData.name,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        project: taskData.project
      };

      // Handle mock task conversion
      if (taskData._id?.startsWith('mock-')) {
        logger.debug('Handling mock task conversion');
        if (!taskData.name?.trim()) {
          logger.debug('Empty name, reloading mock tasks');
          loadMockTasks();
          return true;
        }

        // Create new task and update state in one batch
        const newTask = await createTask(taskToCreate);
        setTasks(prevTasks => {
          const filteredTasks = prevTasks.filter(t => !t._id.startsWith('mock-'));
          return [...filteredTasks, newTask];
        });
      } else if (taskData._id) {
        logger.debug('Updating existing task');
        // Update existing task
        const taskUpdate = {
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          project: taskData.project
        };
        logger.debug('Task update data:', taskUpdate);
        const updatedTask = await updateTask(taskData._id, taskUpdate);
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t._id === taskData._id ? { ...t, ...updatedTask } : t
          )
        );
      } else {
        logger.debug('Creating new task');
        const taskToCreate = {
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          project: taskData.project
        };
        logger.debug('New task data:', taskToCreate);
        const newTask = await createTask(taskToCreate);
        setTasks(prevTasks => [
          ...prevTasks.filter(t => !t._id.startsWith('mock-')),
          newTask
        ]);
      }

      return true;
    } catch (error) {
      logger.error('Error updating task:', error);
      return false;
    }
  }, [loadMockTasks]);

  const setName = useCallback((name) => {
    setEditingName(name);
  }, []);

  return {
    tasks,
    editingTaskId,
    setEditingTaskId,
    editingName,
    setEditingName,
    handleDelete,
    toggleCompletion,
    loadMockTasks,
    updateTask,
    createTask,
    setTasks,
    handleTaskUpdate,
    setName
  };
};
