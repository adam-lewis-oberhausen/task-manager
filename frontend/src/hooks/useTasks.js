import { useState, useEffect, useCallback } from 'react';
import { getTasks, deleteTask, updateTask, updateTaskOrder, createTask } from '../services/taskService';
import { MOCK_TASKS, normalizeTask } from '../utils/taskHelpers';
import { createLogger } from '../utils/logger';
const logger = createLogger('USE_TASKS');

export const useTasks = (token) => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const loadMockTasks = useCallback(() => {
    const normalizedTasks = MOCK_TASKS.map(normalizeTask);
    logger.debug('Loading mock tasks:', normalizedTasks);
    setTasks(normalizedTasks);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        logger.info('Fetching tasks...');
        const tasks = await getTasks(token);
        logger.debug('Tasks retrieved:', tasks);
        logger.debug('Number of tasks:', tasks.length);

        if (tasks.length === 0) {
          logger.info('No tasks found, loading mock tasks');
          loadMockTasks();
        } else {
          logger.debug('Setting tasks:', tasks);
          setTasks(tasks);
        }
      } catch (error) {
        logger.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [token, loadMockTasks, logger]);

  const handleDelete = useCallback(async (id) => {
    try {
      logger.info('Deleting task with id:', id);
      // Only call deleteTask for non-mock tasks
      if (!id.startsWith('mock-')) {
        logger.debug('Deleting real task');
        await deleteTask(id);
      } else {
        logger.debug('Deleting mock task');
      }

      const updatedTasks = tasks.filter(task => task._id !== id);
      logger.debug('Updated tasks after deletion:', updatedTasks);

      // If we deleted all tasks, reload mock tasks
      if (updatedTasks.length === 0) {
        logger.info('Deleted all tasks, loading mock tasks');
        loadMockTasks();
      } else {
        logger.debug('Setting updated tasks');
        setTasks(updatedTasks);
      }
    } catch (error) {
      logger.error('Error deleting task:', error);
    }
  }, [tasks, loadMockTasks]);

  const moveTask = useCallback((dragIndex, hoverIndex) => {
    // Only log if we're actually moving the task to a new position
    if (dragIndex !== hoverIndex) {
      logger.debug(`Moving task from index ${dragIndex} to ${hoverIndex}`);

      const draggedTask = tasks[dragIndex];
      const updatedTasks = [...tasks];
      updatedTasks.splice(dragIndex, 1);
      updatedTasks.splice(hoverIndex, 0, draggedTask);

      // Only update state if the position actually changed
      if (tasks[dragIndex]._id !== updatedTasks[hoverIndex]._id) {
        setTasks(updatedTasks);
      }
    }
  }, [tasks]);

  // Separate function for final order update
  const updateTasksOrder = useCallback(async () => {
    const realTasks = tasks.filter(t => !t._id.startsWith('mock-'));
    if (realTasks.length > 0) {
      const orderUpdates = realTasks.map((task, index) => ({ _id: task._id, order: index }));
      logger.debug('Final task order:', orderUpdates);
      await updateTaskOrder(orderUpdates);
    }
  }, [tasks]);

  const toggleCompletion = useCallback(async (task) => {
    try {
      logger.debug('Toggling completion for task:', task._id);
      const updatedTask = { ...task, completed: !task.completed };
      logger.debug('Updated task state:', updatedTask);
      await updateTask(task._id, updatedTask);
      const updatedTasks = tasks.map(t => (t._id === task._id ? updatedTask : t));
      logger.debug('Updated tasks after toggle:', updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      logger.error('Error toggling task completion:', error);
    }
  }, [tasks]);

  const handleTaskUpdate = useCallback(async (taskData) => {
    try {
      logger.debug('Handling task update for:', taskData);
      let updatedTasks = [...tasks];

      // Handle mock task conversion
      if (taskData._id?.startsWith('mock-')) {
        logger.debug('Handling mock task conversion');
        if (!taskData.name?.trim()) {
          logger.debug('Empty name, reloading mock tasks');
          loadMockTasks();
          return true;
        }

        // Convert mock task to real task - remove _id since it's invalid
        updatedTasks = tasks.filter(t => !t._id.startsWith('mock-'));
        const taskToCreate = {
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          project: taskData.project
        };
        logger.debug('Creating new task from mock:', taskToCreate);
        const newTask = await createTask(taskToCreate);
        updatedTasks = [...updatedTasks, newTask];
      } else if (taskData._id) {
        logger.debug('Updating existing task');
        // Remove mock tasks if any real task exists
        updatedTasks = tasks.filter(t => !t._id.startsWith('mock-'));
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
        updatedTasks = tasks.map(t =>
          t._id === taskData._id ? { ...t, ...updatedTask } : t
        );
      } else {
        logger.debug('Creating new task');
        // Create new task and remove mock tasks
        updatedTasks = tasks.filter(t => !t._id.startsWith('mock-'));
        const taskToCreate = {
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          project: taskData.project
        };
        logger.debug('New task data:', taskToCreate);
        const newTask = await createTask(taskToCreate);
        updatedTasks = [...updatedTasks, newTask];
      }

      logger.debug('Final updated tasks:', updatedTasks);
      setTasks(updatedTasks);
      return true;
    } catch (error) {
      logger.error('Error updating task:', error);
      return false;
    }
  }, [tasks, token, loadMockTasks]);

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
    moveTask,
    toggleCompletion,
    loadMockTasks,
    updateTask,
    createTask,
    setTasks,
    handleTaskUpdate,
    updateTasksOrder,
    setName
  };
};
