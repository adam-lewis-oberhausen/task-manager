import React from 'react';
import styles from './Table.module.css';

const Table = ({ children }) => (
  <table className={styles.customTable}>
    {children}
  </table>
);

const TableHead = ({ children }) => (
  <thead className={styles.tableHead}>
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ children, className = '' }) => (
  <tr className={`${styles.tableRow} ${className}`}>{children}</tr>
);

const TableCell = ({
  children,
  className = '',
  label = '',
  onClick,
  onMouseEnter,
  onMouseLeave,
  'aria-label': ariaLabel
}) => (
  <td
    className={`${styles.tableCell} ${className}`}
    data-label={label}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    aria-label={ariaLabel}
  >
    {children}
  </td>
);

export { Table, TableHead, TableBody, TableRow, TableCell };
