import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import useTaskRow from '../../hooks/tasks/useTaskRow';
import Checkbox from '../ui/Checkbox';
import Button from '../ui/Button';
import { TableRow, TableCell } from '../ui/Table';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import { ReactComponent as DeleteIcon } from '../../assets/delete.svg';
import { ReactComponent as DragHandleIcon } from '../../assets/drag-handle.svg';
import styles from '../ui/Table.module.css';
import stylesButton from '../ui/Button.module.css';
import { normalizeTask } from '../../utils/taskHelpers';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TASK_ROW');

const TaskRow = ({
  task,
  isOverdue,
  priorityColors,
  callbacks
}) => {
  const { handleToggleCompletion, handleEdit, handleDeleteTask } = useTaskRow(task, callbacks);

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
  }, [task]);

  return (
    <TableRow
      className={`${styles.tableRow} ${isOverdue(task.dueDate) ? styles.overdueRow : ''} ${task.completed ? styles.completedRow : ''}`}
    >
      <TableCell className={styles.tableCell}>
        <Button
          icon={DragHandleIcon}
          className={`${stylesButton.iconOnly} ${stylesButton.dragHandle}`}
        />
      </TableCell>
      <TableCell className={styles.tableCell}>
        <Checkbox
          checked={task.completed}
          onChange={handleToggleCompletion}
        />
      </TableCell>
      <TableCell className={styles.tableCell} onClick={handleEdit}>
        {task.assignee}
      </TableCell>
      <TableCell className={styles.tableCell} onClick={handleEdit}>
        {task.name}
      </TableCell>
      <TableCell className={styles.tableCell} onClick={handleEdit}>
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
      </TableCell>
      <TableCell className={`${styles.tableCell} ${priorityColors[task.priority]}`} onClick={handleEdit}>
        {task.priority}
      </TableCell>
      <TableCell className={styles.tableCell}>
        <Button
          onClick={handleEdit}
          icon={EditIcon}
          className={`${stylesButton.iconOnly} ${stylesButton.editButton}`}
        />
      </TableCell>
      <TableCell className={styles.tableCell}>
        <Button
          onClick={handleDeleteTask}
          icon={DeleteIcon}
          className={`${stylesButton.iconOnly} ${stylesButton.deleteButton}`}
        />
      </TableCell>
    </TableRow>
  );
};

TaskRow.propTypes = {
  task: PropTypes.object.isRequired,
  isOverdue: PropTypes.func.isRequired,
  priorityColors: PropTypes.object.isRequired,
  callbacks: PropTypes.shape({
    toggleCompletion: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    startEditing: PropTypes.func.isRequired
  }).isRequired,
};

export default React.memo(TaskRow);
