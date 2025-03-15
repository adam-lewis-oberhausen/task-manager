export const MOCK_TASKS = [
  { _id: 'mock-1', name: 'e.g Determine project goal' },
  { _id: 'mock-2', name: 'e.g Schedule kickoff meeting' },
  { _id: 'mock-3', name: 'e.g. Set final deadline' }
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
