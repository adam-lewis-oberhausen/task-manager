import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
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
  handleNameUpdate, 
  toggleCompletion, 
  handleDelete,
  moveTask,
  isOverdue,
  priorityColors,
  startEditing
}) => {
    const [{ isDragging }, ref] = useDrag({
      type: ItemType,
      item: { index },
    }, [index, moveTask]);

    const [{ isOver }, drop] = useDrop({
      accept: ItemType,
      hover: (draggedItem) => {
        console.log(`Dragging item from index ${draggedItem.index} to ${index}`);
        if (draggedItem.index !== index) {
          moveTask(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    }, [index, moveTask]);

    // console.log(`Rendering TaskRow for task: ${task.name}, index: ${index}`);
    const [showHandle, setShowHandle] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
          <Checkbox checked={task.completed} onChange={() => toggleCompletion(task)} />
        </TableCell>
        <TableCell>{task.assignee}</TableCell>
        <TableCell
          className={`name-cell ${isHovered ? 'hovered' : ''} ${editingTaskId === task._id ? 'editing' : ''}`}
          onMouseEnter={() => setIsHovered(true)}                                                                                             
          onMouseLeave={() => setIsHovered(false)}                                                                                            
          onClick={() => {                                                                                                            
            setEditingTaskId(task._id);
            setEditingName(task._id.startsWith('mock-') ? '' : task.name);
          }}
        > 
          {editingTaskId === task._id ? (                                                                                             
            <input                                                                                                                    
              type="text"                                                                                                             
              className="name-input"                                                                                                  
              value={editingName}                                                                                                     
              onChange={(e) => setEditingName(e.target.value)}                                                                        
              onBlur={handleNameUpdate}                                                                                               
              onKeyPress={(e) => e.key === 'Enter' && handleNameUpdate({ 
                _id: task._id, 
                name: editingName 
              })}
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
          <IconButton color="secondary" onClick={() => handleDelete(task._id)}>
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };
  
export default TaskRow;
