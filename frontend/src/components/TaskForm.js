import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './ui/TaskForm.module.css';
import Button from './ui/Button';
import { normalizeTask } from '../utils/taskHelpers';
import { createLogger } from '../utils/logger';
const logger = createLogger('TASK_FORM');

const TaskForm = ({ task = defaultTask, onSave, onCancel, token, editingTaskId, setEditingName, currentProject }) => {
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const container = editor.container;

      container.style.height = '100%';
      editor.root.style.fontFamily = "'Cousine', monospace";
      editor.root.style.fontSize = '16px';
      editor.root.style.height = '100%';
      editor.root.style.minHeight = '300px';
      editor.root.style.maxHeight = '300px';
      editor.root.style.overflow = 'auto';
    }
  }, []);

  // Reset form when task prop changes
  const prevTaskId = useRef(task?._id);
  
  useEffect(() => {
    if (isMounted.current && task?._id !== prevTaskId.current) {
      const normalizedTask = normalizeTask(task || {});
      logger.debug('Task prop changed, resetting form:', {
        id: normalizedTask._id,
        name: normalizedTask.name,
        description: normalizedTask.description,
        priority: normalizedTask.priority,
        dueDate: normalizedTask.dueDate
      });
      prevTaskId.current = task?._id;
    }
  }, [task]);
    const newName = task?.name || '';
    setName(newName);
    setDescription(task?.description || '');
    setPriority(task?.priority || 'Medium');
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().substr(0, 10) : '');

    // If this is the same task being edited inline, sync the name
    if (editingTaskId === task?._id) {
      setEditingName(newName);
    }
  }, [task, editingTaskId, setEditingName]);

  // Clear form when panel opens for new task
  useEffect(() => {
    if (!task) {
      setName('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim()) {
      logger.warn('Form submission failed - name is required');
      return;
    }

    const taskData = {
      name: name.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      project: currentProject?._id || null
    };

    if (task?._id) {
      taskData._id = task._id;
    }

    logger.info('Submitting task form:', {
      id: taskData._id || 'new task',
      name: taskData.name,
      descriptionLength: taskData.description.length,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      project: taskData.project
    });
    onSave(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            const newName = e.target.value;
            logger.debug('Name field changed:', {
              oldValue: name,
              newValue: newName
            });
            setName(newName);
            // If this is the same task being edited inline, sync the name
            if (editingTaskId === task?._id) {
              setEditingName(newName);
            }
          }}
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
          value={dueDate}
          onChange={(e) => {
            logger.debug('Due date changed:', {
              oldValue: dueDate,
              newValue: e.target.value
            });
            setDueDate(e.target.value);
          }}
          aria-label="Due Date"
          className={`${styles.input} ${styles.dateInput}`}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>Description</label>
          <ReactQuill
            ref={quillRef}
            id="description"
            value={description}
            onChange={(value) => {
              logger.debug('Description changed:', {
                oldLength: description.length,
                newLength: value.length
              });
              setDescription(value);
            }}
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
          value={priority}
          onChange={(e) => {
            logger.debug('Priority changed:', {
              oldValue: priority,
              newValue: e.target.value
            });
            setPriority(e.target.value);
          }}
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
    name: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    dueDate: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  editingTaskId: PropTypes.string,
  setEditingName: PropTypes.func
};

// Use default parameters instead of defaultProps
const defaultTask = {
  name: '',
  description: '',
  priority: 'Medium',
  dueDate: ''
};

export default React.memo(TaskForm);
