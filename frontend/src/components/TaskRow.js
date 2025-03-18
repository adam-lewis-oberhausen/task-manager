import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { taskRowLogger } from '../utils/logger';
import Checkbox from './ui/Checkbox';
import Button from './ui/Button';
import { TableRow, TableCell } from './ui/Table';
import { ReactComponent as EditIcon } from '../assets/edit.svg';
import { ReactComponent as DeleteIcon } from '../assets/delete.svg';
import { ReactComponent as DragHandleIcon } from '../assets/drag-handle.svg';
import { ItemType } from '../constants/dndTypes';
import styles from './ui/Table.module.css';

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
  updateTasksOrder,
  setName
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
    const inputRef = useRef(null); 

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
        className={`${styles.tableRow} ${isOverdue(task.dueDate) ? styles.overdueRow : ''} ${task.completed ? styles.completedRow : ''}`}
        onMouseEnter={() => setShowHandle(true)}
        onMouseLeave={() => setShowHandle(false)}
      >
        <TableCell className={styles.tableCell}>
          <DragHandleIcon />
        </TableCell>
        <TableCell className={`${styles.tableCell}`}>
          <Checkbox
            checked={task.completed} 
            onChange={() => {
              taskRowLogger.debug('Toggling completion for task:', task._id, 'from:', task.completed, 'to:', !task.completed);
              toggleCompletion(task);
            }} 
          />
        </TableCell>
        <TableCell className={styles.tableCell}>{task.assignee}</TableCell>
        <TableCell className={`${styles.tableCell} ${isHovered ? styles.nameCellHovered : ''} ${editingTaskId === task._id ? styles.nameCellEditing : ''}`}
           onMouseEnter={(e) => {
            // taskRowLogger.debug('Mouse enter event:', e);
            // taskRowLogger.debug('The mouse has entered the name cell for task:', task._id);                                                                                                            
            
            // Clear any existing editing state first                                                                        
            if (editingTaskId && editingTaskId !== task._id) {                                                               
              setEditingTaskId(null);                                                                                        
              setEditingName('');                                                                                            
            }                                                                                                                
                                                                                                                              
            setIsHovered(true);                                                                                              
            
            // Only set editing state if we're not already focused on an input                                                         
            if (!document.activeElement.classList.contains(styles.nameInput)) {                                                        
              setEditingTaskId(task._id);                                                                                              
              setEditingName(task.name);
              taskRowLogger.debug('Setting editing state for task:', task._id);                                                                                              
            } else {
              taskRowLogger.debug('Keeping editing state for task:', task._id);                                                                                              
            }
          }}                                                                                                                               
          onMouseLeave={(e) => {                                                                                              
            // taskRowLogger.debug('The mouse has left the name cell for task:', task._id);                                     
                                                                                                                             
            // Only clear state if we're not moving to another task cell                                                     
            const relatedTarget = e.relatedTarget;                                                                       
            if (!relatedTarget || !relatedTarget.closest('td')) {                                                            
              setIsHovered(false);                                                                                           
            // Only clear editing state if we're not focused on the input                                                            
            if (editingTaskId === task._id &&                                                                                        
              !document.activeElement.classList.contains(styles.nameInput)) {
                taskRowLogger.debug('Clearing editing state for task:', task._id);                                                      
                setEditingTaskId(null);                                                                                                
                setEditingName('');                                                                                                    
              } else {
                taskRowLogger.debug('Keeping editing state for task:', task._id);                                                                 
              }                                                                                                         
            }                                                                                                                
          }}  
          onClick={(e) => {
            taskRowLogger.debug('Name cell clicked for task:', task._id);

            // Ensure we have a valid event target
            if (!e || !e.currentTarget) {
              taskRowLogger.warn('Invalid click event:', e);
              return;
            }
                                                                                                                              
             // If clicking on the input, just focus it                                                                       
             if (e.target.tagName === 'INPUT') {                                                                              
              e.target.focus();                                                                                              
              e.target.select();                                                                                             
              return;                                                                                                        
            }  
            
            // If not already editing, start editing
            if (editingTaskId !== task._id) {
              taskRowLogger.debug('Starting edit for task:', task._id);
              startEditing(task);
              setEditingTaskId(task._id);
              setEditingName(task._id.startsWith('mock-') ? '' : task.name);
            }
            
            // Focus the input after a short delay to allow state to update                                                                  
            setTimeout(() => {                                                                                                               
            try {                                                                                                                          
              const cell = e.currentTarget;                                                                                                
              if (cell) {                                                                                                                  
                const input = cell.querySelector('input');                                                                                 
                if (input) {                                                                                                               
                  input.focus();                                                                                                           
                  input.select();                                                                                                          
                } else {                                                                                                                   
                  taskRowLogger.warn('Input element not found in cell');                                                                   
                }                                                                                                                          
              }                                                                                                                            
            } catch (error) {                                                                                                              
              taskRowLogger.error('Error focusing input:', error);                                                                         
            }                                                                                                                              
          }, 50);                                                                                                                          
        }}
        > 
          {editingTaskId === task._id ? (
            <input
              type="text"
              className={`${styles.nameInput} ${(isHovered || editingTaskId === task._id) ? '' : 'hidden'}`}
              value={editingName}
              ref={inputRef}
              onClick={(e) => {                                                                                                          
                e.stopPropagation();                                                                                                     
                startEditing(task);                                                                                                      
                setName(editingName);                                                                                       
                e.target.focus();                                                                                                        
                e.target.select();                                                                                                       
              }}
              onChange={(e) => {
                const newName = e.target.value;
                setEditingName(newName);
                if (editingTaskId === task._id) {
                  setName(newName);
                }
              }}
              onFocus={() => {                                                                                                                                                                                               
                setEditingTaskId(task._id);                                                                                              
                setEditingName(task.name);                                                                                               
              }}
              onBlur={(e) => {
                // Only update if the name has changed and isn't empty
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
                // Only clear editing state if we're not clicking on another cell
                if (!e.relatedTarget || !e.relatedTarget.closest('td')) {
                  setEditingTaskId(null);
                  setEditingName('');
                }
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
        <TableCell className={`${styles.tableCell} ${priorityColors[task.priority]}`}>{task.priority}</TableCell>
        <TableCell className={styles.tableCell}>
          <Button onClick={() => {
            setEditingTaskId(null);
            setEditingName('');
            startEditing(task);
          }}>
            <EditIcon />
          </Button>
        </TableCell>
        <TableCell className={styles.tableCell}>
          <Button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
                taskRowLogger.debug('Deleting task:', task._id);
                handleDelete(task._id);
              }
            }}
          >
            <DeleteIcon />
          </Button>
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
