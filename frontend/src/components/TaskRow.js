import React from 'react';
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
import stylesButton from './ui/Button.module.css';

const TaskRow = ({ 
  task, 
  index, 
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
        taskRowLogger.debug('Task hovered over:', task._id, 'by:', draggedItem.index);
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    drop: () => {
      updateTasksOrder();
    }
  }, [index, moveTask, task._id, updateTasksOrder]);

  return (
    <TableRow
      ref={(node) => ref(drop(node))}
      className={`${styles.tableRow} ${isOverdue(task.dueDate) ? styles.overdueRow : ''} ${task.completed ? styles.completedRow : ''}`}
    >
      <TableCell className={styles.tableCell}>
        <Button 
          icon={DragHandleIcon}
          className={`${stylesButton.iconOnly} ${stylesButton.dragHandle}`}
        >
        </Button>
      </TableCell>
      <TableCell className={styles.tableCell}>
        <Checkbox
          checked={task.completed} 
          onChange={() => {
            taskRowLogger.debug('Toggling completion for task:', task._id);
            toggleCompletion(task);
          }} 
        />
      </TableCell>
      <TableCell className={styles.tableCell}
      onClick={() => startEditing(task)}
      >
        {task.assignee}
      </TableCell>
      <TableCell className={styles.tableCell}
        onClick={() => startEditing(task)}
      >        
        {task.name}
      </TableCell>
      <TableCell className={styles.tableCell}
        onClick={() => startEditing(task)}
      >
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
      </TableCell>
      <TableCell className={`${styles.tableCell} ${priorityColors[task.priority]}`} 
        onClick={() => startEditing(task)}
      >
        {task.priority}
      </TableCell>
      <TableCell className={styles.tableCell}>
        <Button 
          onClick={() => startEditing(task)}
          icon={EditIcon} 
          className={`${stylesButton.iconOnly} ${stylesButton.editButton}`}
        >
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
          icon={DeleteIcon}
          className={`${stylesButton.iconOnly} ${stylesButton.deleteButton}`}>        
        </Button>        
      </TableCell>
    </TableRow>
  );
};

TaskRow.propTypes = {
  task: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  toggleCompletion: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  moveTask: PropTypes.func.isRequired,
  isOverdue: PropTypes.func.isRequired,
  priorityColors: PropTypes.object.isRequired,
  startEditing: PropTypes.func.isRequired,
  updateTasksOrder: PropTypes.func.isRequired
};

export default React.memo(TaskRow);
