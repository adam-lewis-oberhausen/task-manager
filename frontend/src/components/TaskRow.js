import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Checkbox from './ui/Checkbox';
import Button from './ui/Button';
import { TableRow, TableCell } from './ui/Table';
import { ReactComponent as EditIcon } from '../assets/edit.svg';
import { ReactComponent as DeleteIcon } from '../assets/delete.svg';
import { ReactComponent as DragHandleIcon } from '../assets/drag-handle.svg';
import styles from './ui/Table.module.css';
import stylesButton from './ui/Button.module.css';
import { createLogger } from '../utils/logger';
const logger = createLogger('TASK_ROW');

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
  // Log task state changes
  useEffect(() => {
    const normalizedTask = normalizeTask(task);
    logger.debug('Task state changed:', {
      id: normalizedTask._id,
      name: normalizedTask.name,
      completed: normalizedTask.completed,
      priority: normalizedTask.priority,
      dueDate: normalizedTask.dueDate
    });
  }, [task.completed, task.priority, task.dueDate]);

  // Log drag-and-drop operations
  useEffect(() => {
    const handleDragStart = () => {
      logger.debug('Drag started for task:', {
        id: task._id,
        name: task.name,
        index
      });
    };

    const handleDragEnd = () => {
      logger.debug('Drag ended for task:', {
        id: task._id,
        name: task.name,
        index
      });
      updateTasksOrder();
    };

    const dragHandle = document.querySelector(`.${stylesButton.dragHandle}`);
    if (dragHandle) {
      dragHandle.addEventListener('dragstart', handleDragStart);
      dragHandle.addEventListener('dragend', handleDragEnd);
    }

    return () => {
      if (dragHandle) {
        dragHandle.removeEventListener('dragstart', handleDragStart);
        dragHandle.removeEventListener('dragend', handleDragEnd);
      }
    };
  }, [task._id, task.name, index, updateTasksOrder]);

  return (
    <TableRow
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
            logger.info('Toggling task completion:', {
              id: task._id,
              name: task.name,
              currentState: task.completed,
              newState: !task.completed
            });
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
          onClick={() => {
            logger.info('Starting task edit:', {
              id: task._id,
              name: task.name
            });
            startEditing(task);
          }}
          icon={EditIcon}
          className={`${stylesButton.iconOnly} ${stylesButton.editButton}`}
        >
        </Button>
      </TableCell>
      <TableCell className={styles.tableCell}>
        <Button
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
              logger.info('Deleting task:', {
                id: task._id,
                name: task.name
              });
              handleDelete(task._id);
            } else {
              logger.debug('Task deletion canceled by user:', {
                id: task._id,
                name: task.name
              });
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
