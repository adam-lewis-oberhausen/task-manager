import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { taskRowLogger } from '../utils/logger';
import { TableRow, TableCell, Checkbox, IconButton } from '@mui/material';
import { Edit, Delete, DragHandle } from '@mui/icons-material';
import { ItemType } from '../constants/dndTypes';

const TaskRow = ({ 
  task, 
  index, 
  editingTaskId, 
  setEditingTaskId, 
  editingName, 
  setEditingName, 
  handleTaskUpdate,
  toggleCompletion, 
  handleDelete,
  moveTask,
  isOverdue,
  priorityColors,
  startEditing,
  updateTasksOrder
}) => {
    const [, ref] = useDrag({
      type: ItemType,
      item: () => {
        taskRowLogger.info('Dragging started for task:', task._id);
        return { index };
      },
      end: (item, monitor) => {
        if (monitor.didDrop()) {
          taskRowLogger.debug('Dragging ended for task:', task._id);
        }
      }
    }, [index, moveTask, task._id]);

    const [, drop] = useDrop({
      accept: ItemType,
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          // Only log if we're actually moving to a new position
          taskRowLogger.debug('Task hovered over:', task._id, 'by:', draggedItem.index);
          moveTask(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
      drop: () => {
        // Update order when drop is complete
        updateTasksOrder();
      }
    }, [index, moveTask, task._id, updateTasksOrder]);

    const [, setShowHandle] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      taskRowLogger.debug('TaskRow rendered for task:', task._id);
    }, [task._id]);

    useEffect(() => {
      if (editingTaskId === task._id) {
        taskRowLogger.debug('Editing state changed for task:', task._id, {
          editingTaskId,
          editingName: editingName || '(empty for mock task)'
        });
      }
    }, [editingTaskId, editingName, task._id]);

    return (
      <TableRow
        ref={(node) => ref(drop(node))}
        className={`${isOverdue(task.dueDate) ? 'overdue' : ''} ${task.completed ? 'completed' : ''}`}
        onMouseEnter={() => setShowHandle(true)}
        onMouseLeave={() => setShowHandle(false)}
      >
        <TableCell style={{ border: 'none' }}>
          <DragHandle />
        </TableCell>
        <TableCell>
          <Checkbox 
            checked={task.completed} 
            onChange={() => {
              taskRowLogger.debug('Toggling completion for task:', task._id, 'from:', task.completed, 'to:', !task.completed);
              toggleCompletion(task);
            }} 
          />
        </TableCell>
        <TableCell>{task.assignee}</TableCell>
        <TableCell
          className={`name-cell ${isHovered ? 'hovered' : ''} ${editingTaskId === task._id ? 'editing' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            // If clicking directly on the input, focus it
            if (e.target.tagName === 'INPUT') {
              e.target.focus();
              return;
            }
            
            // If already editing this task, just focus the input
            if (editingTaskId === task._id) {
              const input = e.currentTarget.querySelector('input');
              if (input) {
                input.focus();
              }
              return;
            }
            
            // Otherwise open task panel and start inline edit
            taskRowLogger.debug('Starting edit for task:', task._id);
            startEditing(task);
            setEditingTaskId(task._id);
            setEditingName(task._id.startsWith('mock-') ? '' : task.name);
          }}
        > 
          {editingTaskId === task._id ? (
            <input
              type="text"
              className="name-input"
              value={editingName}
              onChange={(e) => {
                const newName = e.target.value;
                setEditingName(newName);
                // If the task panel is open for this task, update the form
                if (editingTaskId === task._id) {
                  setName(newName);
                }
              }}
              onBlur={(e) => {
                // Only update if the name has changed
                if (editingName.trim() && editingName !== task.name) {
                  const taskUpdate = {
                    _id: task._id,
                    name: editingName,
                    description: task.description,
                    priority: task.priority,
                    dueDate: task.dueDate
                  };
                  handleTaskUpdate(taskUpdate);
                }
                setEditingTaskId(null);
                setEditingName('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const taskUpdate = {
                    _id: task._id,
                    name: editingName,
                    description: task.description,
                    priority: task.priority,
                    dueDate: task.dueDate
                  };
                  handleTaskUpdate(taskUpdate);
                  setEditingTaskId(null);
                  setEditingName('');
                }
              }}
              autoFocus
            />
          ) : (
            task.name
          )}
        </TableCell>
        <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</TableCell>
        <TableCell className={priorityColors[task.priority]}>{task.priority}</TableCell>
        <TableCell>
          <IconButton color="primary" onClick={() => {
            setEditingTaskId(null);
            setEditingName('');
            startEditing(task);
          }}>
            <Edit />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton 
            color="secondary" 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
                taskRowLogger.debug('Deleting task:', task._id);
                handleDelete(task._id);
              }
            }}
          >
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };
  
TaskRow.propTypes = {
  task: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  editingTaskId: PropTypes.string,
  setEditingTaskId: PropTypes.func.isRequired,
  editingName: PropTypes.string,
  setEditingName: PropTypes.func.isRequired,
  handleTaskUpdate: PropTypes.func.isRequired,
  toggleCompletion: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  moveTask: PropTypes.func.isRequired,
  isOverdue: PropTypes.func.isRequired,
  priorityColors: PropTypes.object.isRequired,
  startEditing: PropTypes.func.isRequired,
  updateTasksOrder: PropTypes.func.isRequired,
  setName: PropTypes.func
};

export default React.memo(TaskRow);
