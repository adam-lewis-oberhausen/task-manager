import { useState, useEffect, useCallback } from 'react';
import { getTasks, deleteTask, updateTask, updateTaskOrder, createTask } from '../services/taskService';
import { MOCK_TASKS } from '../utils/taskHelpers';
import { tasksLogger } from '../utils/logger';

export const useTasks = (token) => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const loadMockTasks = useCallback(() => {
    setTasks([...MOCK_TASKS]);
  }, []);

  const logger = tasksLogger;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        logger.debug('Fetching tasks...');
        const tasks = await getTasks(token);
        logger.debug('Tasks retrieved:', tasks);
        logger.debug('Number of tasks:', tasks.length);
        
        if (tasks.length === 0) {
          logger.debug('No tasks found, loading mock tasks');
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
      logger.debug('Deleting task with id:', id);
      // Only call deleteTask for non-mock tasks
      if (!id.startsWith('mock-')) {
        logger.debug('Deleting real task');
        await deleteTask(id);
      } else {
        logger.debug('Deleting mock task');
      }
      
      const updatedTasks = tasks.filter(task => task._id !== id);
      logger.debug('Updated tasks after deletion:', updatedTasks);
      
      // If we deleted the last real task, reload mock tasks
      if (updatedTasks.length === 0 && tasks.some(t => !t._id.startsWith('mock-'))) {
        logger.debug('Deleted last real task, loading mock tasks');
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
    logger.debug(`Moving task from index ${dragIndex} to ${hoverIndex}`);
    const draggedTask = tasks[dragIndex];
    logger.debug('Dragged task:', draggedTask);
    
    const updatedTasks = [...tasks];
    updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);
    logger.debug('Updated tasks after move:', updatedTasks);
    setTasks(updatedTasks);

    // Only update order for real tasks
    const realTasks = updatedTasks.filter(t => !t._id.startsWith('mock-'));
    logger.debug('Real tasks for order update:', realTasks);
    if (realTasks.length > 0) {
      const orderUpdates = realTasks.map((task, index) => ({ _id: task._id, order: index }));
      logger.debug('Updating task order with:', orderUpdates);
      updateTaskOrder(orderUpdates)
        .catch(error => logger.error('Error updating task order:', error));
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
          dueDate: taskData.dueDate
        };
        logger.debug('Creating new task from mock:', taskToCreate);
        const newTask = await createTask(taskToCreate, token);
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
          dueDate: taskData.dueDate
        };
        logger.debug('Task update data:', taskUpdate);
        const updatedTask = await updateTask(taskData._id, taskUpdate, token);
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
          dueDate: taskData.dueDate
        };
        logger.debug('New task data:', taskToCreate);
        const newTask = await createTask(taskToCreate, token);
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
    handleTaskUpdate
  };
};
