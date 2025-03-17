import React from 'react';
import styles from './Table.module.css';

const Table = ({ children }) => (
  <table className={styles.customTable}>
    {children}
  </table>
);

const TableHead = ({ children }) => (
  <thead className={styles.tableHead}>
    <tr className={styles.tableRow}>{children}</tr>
  </thead>
);

const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ children, className = '' }) => (
  <tr className={`table-row ${className}`}>{children}</tr>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`table-cell ${className}`}>{children}</td>
);

export { Table, TableHead, TableBody, TableRow, TableCell };
