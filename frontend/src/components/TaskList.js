import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, IconButton, Button } from '@mui/material';
import { Edit, Delete, DragHandle } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getTasks, deleteTask, updateTask, updateTaskOrder } from '../services/taskService';
import TaskForm from './TaskForm';
import '../styles/App.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [pendingEditTask, setPendingEditTask] = useState(null);
  const [changeMessage, setChangeMessage] = useState("");
  const [sortField, setSortField] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      setTasks(tasks);
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter(task => task._id !== id));
    if (editingTask && editingTask._id === id) {
      setEditingTask(null);
    }
  };

  const addTask = (task) => {
    setTasks([...tasks, task]);
    setAddingTask(false);
  };

  const updateTaskInList = (id, updatedTask) => {
    const updatedTasks = tasks.map(task => (task._id === id ? { ...task, ...updatedTask } : task));
    setTasks(updatedTasks);
    setEditingTask(null);
    setAddingTask(false);
  };

  const startEditing = (task) => {
    if (editingTask && editingTask._id !== task._id) {
      if (changeMessage) {
        const confirmDiscard = window.confirm(`You have unsaved changes:\n${changeMessage}\nDo you really want to discard them?`);
        if (confirmDiscard) {
          setEditingTask(task);
          setPendingEditTask(null);
          setChangeMessage("");
        } else {
          setPendingEditTask(task);
        }
      } else {
        setEditingTask(task);
      }
    } else {
      setEditingTask(task);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setAddingTask(false);
    setChangeMessage("");
  };

  const toggleCompletion = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    await updateTask(task._id, updatedTask);
    updateTaskInList(task._id, updatedTask);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const priorityColors = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
  };

  const handleSort = (field) => {
    const order = (sortField === field && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
    const sortedTasks = [...tasks].sort((a, b) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setTasks(sortedTasks);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);

    // Optionally, update the order in your backend/database
    updateTaskOrder(items.map((task, index) => ({ _id: task._id, order: index })));
  };

  return (
    <div className="container">
      <h1>Task List</h1>
      {!(addingTask || editingTask) && (
        <Button variant="contained" color="primary" onClick={() => setAddingTask(true)}>Add New Task</Button>
      )}
      {(addingTask || editingTask) && (
        <TaskForm
          addTask={addTask}
          updateTaskInList={updateTaskInList}
          task={editingTask}
          onCancel={handleCancelEdit}
        />
      )}
      <TableContainer component={Paper}>
        <Table className="task-table">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Mark Complete</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {tasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={isOverdue(task.dueDate) ? 'overdue' : ''}
                        >
                          <TableCell {...provided.dragHandleProps}>
                            <DragHandle />
                          </TableCell>
                          <TableCell>
                            <Checkbox checked={task.completed} onChange={() => toggleCompletion(task)} />
                          </TableCell>
                          <TableCell>{task.title}</TableCell>
                          <TableCell className={priorityColors[task.priority]}>{task.priority}</TableCell>
                          <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => startEditing(task)}>
                              <Edit />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton color="secondary" onClick={() => handleDelete(task._id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskList;
