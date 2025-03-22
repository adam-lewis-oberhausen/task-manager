import React from 'react';
import PropTypes from 'prop-types';
import { TableHead, TableRow, TableCell } from '../ui/Table';
import styles from './ui/Table.module.css';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TASK_TABLE_HEADER');

/**
 * Renders the table header for the task list
 * @returns {JSX.Element} Table header component
 */
const TaskTableHeader = () => {
  logger.debug('Rendering task table header');

  return (
    <TableHead>
      <TableRow>
        <TableCell className={styles.tableCellHeader}></TableCell>
        <TableCell className={styles.tableCellHeader}>Complete</TableCell>
        <TableCell className={styles.tableCellHeader}>Assignee</TableCell>
        <TableCell className={styles.tableCellHeader}>Name</TableCell>
        <TableCell className={styles.tableCellHeader}>Due Date</TableCell>
        <TableCell className={styles.tableCellHeader}>Priority</TableCell>
        <TableCell className={styles.tableCellHeader}>Edit</TableCell>
        <TableCell className={styles.tableCellHeader}>Delete</TableCell>
      </TableRow>
    </TableHead>
  );
};

TaskTableHeader.propTypes = {
  // Add any future props here
};

export default React.memo(TaskTableHeader);
