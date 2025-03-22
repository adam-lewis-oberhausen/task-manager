import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useTaskForm from '../../hooks/useTaskForm';
import Button from '../ui/Button';
import styles from './TaskForm.module.css';

const TaskForm = ({ task, onSave, onCancel, currentProject }) => {
  const quillRef = useRef(null);
  const { formState, handleChange, handleDescriptionChange, handleSubmit } = useTaskForm(task, async (taskData) => {
    const fullTask = {
      ...taskData,
      project: currentProject?._id || null
    };
    if (task?._id) {
      fullTask._id = task._id;
    }
    await onSave(fullTask);
  });

  // Configure Quill editor on mount
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const container = editor.container;
      container.style.height = '100%';
      editor.root.style.fontFamily = "'Cousine', monospace";
      editor.root.style.fontSize = '16px';
      editor.root.style.minHeight = '100px';
      editor.root.style.maxHeight = '300px';
      editor.root.style.overflow = 'auto';
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
          aria-label="Name"
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="dueDate" className={styles.label}>Due Date</label>
        <input
          id="dueDate"
          type="date"
          name="dueDate"
          value={formState.dueDate}
          onChange={handleChange}
          aria-label="Due Date"
          className={`${styles.input} ${styles.dateInput}`}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>Description</label>
        <ReactQuill
          ref={quillRef}
          id="description"
          value={formState.description}
          onChange={handleDescriptionChange}
          modules={{
            toolbar: [
              [{ 'header': [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link', 'image'],
              ['clean']
            ]
          }}
          formats={[
            'header',
            'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image'
          ]}
          theme="snow"
          aria-label="Description"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="priority" className={styles.label}>Priority</label>
        <select
          id="priority"
          name="priority"
          value={formState.priority}
          onChange={handleChange}
          aria-label="Priority"
          className={`${styles.input} ${styles.select}`}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        <Button type="submit" className={styles.button}>Save Task</Button>
        <Button type="button" className={styles.button} onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

TaskForm.propTypes = {
  task: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    dueDate: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  currentProject: PropTypes.shape({
    _id: PropTypes.string
  })
};

export default React.memo(TaskForm);
