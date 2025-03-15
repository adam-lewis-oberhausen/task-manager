import { useState, useEffect, useCallback } from 'react';
import { getTasks, deleteTask, updateTask, updateTaskOrder, createTask } from '../services/taskService';
import { MOCK_TASKS } from '../utils/taskHelpers';
import { useTasksLogger } from '../utils/logger';

export const useTasks = (token) => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const loadMockTasks = useCallback(() => {
    setTasks([...MOCK_TASKS]);
  }, []);

  const logger = useTasksLogger();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        logger.debug('Fetching tasks...');
        const tasks = await getTasks(token);
        logger.debug('Tasks retrieved:', tasks);
        
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
    const logger = useTasksLogger();
    try {
      // Only call deleteTask for non-mock tasks
      if (!id.startsWith('mock-')) {
        await deleteTask(id);
      }
      
      const updatedTasks = tasks.filter(task => task._id !== id);
      
      // If we deleted the last real task, reload mock tasks
      if (updatedTasks.length === 0 && tasks.some(t => !t._id.startsWith('mock-'))) {
        loadMockTasks();
      } else {
        setTasks(updatedTasks);
      }
    } catch (error) {
      logger.error('Error deleting task:', error);
    }
  }, [tasks, loadMockTasks]);

  const moveTask = useCallback((dragIndex, hoverIndex) => {
    const logger = useTasksLogger;
    const draggedTask = tasks[dragIndex];
    const updatedTasks = [...tasks];
    updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);
    setTasks(updatedTasks);

    // Only update order for real tasks
    const realTasks = updatedTasks.filter(t => !t._id.startsWith('mock-'));
    if (realTasks.length > 0) {
      updateTaskOrder(realTasks.map((task, index) => ({ _id: task._id, order: index })))
        .catch(error => logger.error('Error updating task order:', error));
    }
  }, [tasks]);

  const toggleCompletion = useCallback(async (task) => {
    const logger = useTasksLogger;
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task._id, updatedTask);
      setTasks(tasks.map(t => (t._id === task._id ? updatedTask : t)));
    } catch (error) {
      logger.error('Error toggling task completion:', error);
    }
  }, [tasks]);

  const handleTaskUpdate = useCallback(async (taskData) => {
    const logger = useTasksLogger;
    try {
      let updatedTasks = [...tasks];
      
      // Handle mock task conversion
      if (taskData._id?.startsWith('mock-')) {
        if (!taskData.name?.trim()) {
          // Empty name - reload mock tasks
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
        const newTask = await createTask(taskToCreate, token);
        updatedTasks = [...updatedTasks, newTask];
      } else if (taskData._id) {
        // Remove mock tasks if any real task exists
        updatedTasks = tasks.filter(t => !t._id.startsWith('mock-'));
        // Update existing task
        const taskUpdate = {
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate
        };
        const updatedTask = await updateTask(taskData._id, taskUpdate, token);
        updatedTasks = tasks.map(t => 
          t._id === taskData._id ? { ...t, ...updatedTask } : t
        );
      } else {
        // Create new task and remove mock tasks
        updatedTasks = tasks.filter(t => !t._id.startsWith('mock-'));
        const taskToCreate = {
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate
        };
        const newTask = await createTask(taskToCreate, token);
        updatedTasks = [...updatedTasks, newTask];
      }

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
