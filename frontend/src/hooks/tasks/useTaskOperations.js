import { useCallback } from 'react';
import { deleteTask, updateTask, createTask } from '../../services/taskService';
import { createLogger } from '../../utils/logger';

const logger = createLogger('USE_TASK_OPERATIONS');

const useTaskOperations = (tasks, setTasks, loadMockTasks) => {
  const handleDelete = useCallback(async (id) => {
    try {
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
      
      if (!id.startsWith('mock-')) {
        await deleteTask(id);
      }

      setTasks(prevTasks => {
        if (prevTasks.length === 0) {
          loadMockTasks();
        }
        return prevTasks;
      });
    } catch (error) {
      logger.error('Error deleting task:', error);
    }
  }, [tasks, loadMockTasks, setTasks]);

  const toggleCompletion = useCallback(async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task._id, updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t._id === task._id ? updatedTask : t
        )
      );
    } catch (error) {
      logger.error('Error toggling task completion:', error);
    }
  }, [setTasks]);

  const handleTaskUpdate = useCallback(async (taskData) => {
    try {
      if (taskData._id?.startsWith('mock-')) {
        if (!taskData.name?.trim()) {
          loadMockTasks();
          return true;
        }

        const newTask = await createTask({
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          project: taskData.project
        });
        
        setTasks(prevTasks => {
          const filteredTasks = prevTasks.filter(t => !t._id.startsWith('mock-'));
          return [...filteredTasks, newTask];
        });
      } else if (taskData._id) {
        const updatedTask = await updateTask(taskData._id, {
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          project: taskData.project
        });
        
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t._id === taskData._id ? { ...t, ...updatedTask } : t
          )
        );
      } else {
        const newTask = await createTask({
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          project: taskData.project
        });
        
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
  }, [loadMockTasks, setTasks]);

  return {
    handleDelete,
    toggleCompletion,
    handleTaskUpdate
  };
};

export default useTaskOperations;
