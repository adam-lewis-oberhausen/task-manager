export const MOCK_TASKS = [
  { 
    _id: 'mock-1', 
    name: 'e.g Determine project goal',
    description: '',
    completed: false,
    priority: 'Medium',
    dueDate: null,
    project: null,
    order: 0
  },
  { 
    _id: 'mock-2', 
    name: 'e.g Schedule kickoff meeting',
    description: '',
    completed: false,
    priority: 'Medium',
    dueDate: null,
    project: null,
    order: 1
  },
  { 
    _id: 'mock-3', 
    name: 'e.g. Set final deadline',
    description: '',
    completed: false,
    priority: 'Medium',
    dueDate: null,
    project: null,
    order: 2
  }
];

export const priorityColors = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const areAllTasksMock = (tasks) => {
  return tasks.length > 0 && tasks.every(t => t._id.startsWith('mock-'));
};

export const normalizeTask = (task) => {
  return {
    _id: task._id || `mock-${Date.now()}`,
    name: task.name || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    dueDate: task.dueDate || null,
    completed: task.completed || false,
    project: task.project || null,
    order: task.order || 0
  };
};
