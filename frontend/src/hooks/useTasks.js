import { useState, useEffect, useCallback } from 'react';
import { getTasks, deleteTask, updateTask, updateTaskOrder, createTask } from '../services/taskService';
import { MOCK_TASKS, areAllTasksMock } from '../utils/taskHelpers';

export const useTasks = (token) => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const loadMockTasks = useCallback(() => {
    setTasks([...MOCK_TASKS]);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await getTasks(token);
        if (tasks.length === 0) {
          loadMockTasks();
        } else {
          setTasks(tasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [token, loadMockTasks]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteTask(id);
      const updatedTasks = tasks.filter(task => task._id !== id);
      
      if (updatedTasks.length === 0 && tasks.some(t => !t._id.startsWith('mock-'))) {
        loadMockTasks();
      } else {
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [tasks, loadMockTasks]);

  const moveTask = useCallback((dragIndex, hoverIndex) => {
    const draggedTask = tasks[dragIndex];
    const updatedTasks = [...tasks];
    updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);
    setTasks(updatedTasks);
    updateTaskOrder(updatedTasks.map((task, index) => ({ _id: task._id, order: index })))
      .catch(error => console.error('Error updating task order:', error));
  }, [tasks]);

  const toggleCompletion = useCallback(async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task._id, updatedTask);
      setTasks(tasks.map(t => (t._id === task._id ? updatedTask : t)));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  }, [tasks]);

  const handleNameUpdate = useCallback(async () => {
    if (!editingTaskId) return;

    // If it's a mock task and name is empty, reload mock tasks
    if (editingTaskId.startsWith('mock-') && !editingName.trim()) {
      loadMockTasks();
      setEditingTaskId(null);
      setEditingName('');
      return;
    }

    // If it's a mock task and has content, remove other mock tasks
    if (editingTaskId.startsWith('mock-') && editingName.trim()) {
      const updatedTasks = tasks.filter(t => !t._id.startsWith('mock-'));
      try {
        const newTask = await createTask({ name: editingName }, token);
        setTasks([...updatedTasks, newTask]);
      } catch (error) {
        console.error('Error creating task:', error);
      }
      setEditingTaskId(null);
      setEditingName('');
      return;
    }

    // Handle regular task updates
    if (editingName.trim()) {
      try {
        await updateTask(editingTaskId, { name: editingName }, token);
        setTasks(tasks.map(t => 
          t._id === editingTaskId ? { ...t, name: editingName } : t
        ));
      } catch (error) {
        console.error('Error updating task name:', error);
      }
    }
    setEditingTaskId(null);
    setEditingName('');
  }, [editingTaskId, editingName, tasks, token, loadMockTasks, updateTask, createTask]);

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
    handleNameUpdate
  };
};
