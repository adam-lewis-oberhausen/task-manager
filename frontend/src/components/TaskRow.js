import React, { useState, useEffect } from 'react';
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
  startEditing
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
          taskRowLogger.debug('Task hovered over:', task._id, 'by:', draggedItem.index);
          moveTask(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    }, [index, moveTask, task._id]);

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
            // Only start editing if we're not already editing and the click wasn't on the input
            if (editingTaskId !== task._id && e.target.tagName !== 'INPUT') {
              taskRowLogger.debug('Starting inline edit for task:', task._id);
              setEditingTaskId(task._id);
              // Clear name if editing a mock task, otherwise use current name
              const newEditingName = task._id.startsWith('mock-') ? '' : task.name;
              taskRowLogger.debug('Editing name set to:', newEditingName || '(empty for mock task)');
              setEditingName(newEditingName);
            }
          }}
        > 
          {editingTaskId === task._id ? (                                                                                             
            <input                                                                                                                    
              type="text"                                                                                                             
              className="name-input"                                                                                                  
              value={editingName}                                                                                                     
              onChange={(e) => setEditingName(e.target.value)}                                                                        
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
  
export default React.memo(TaskRow);
