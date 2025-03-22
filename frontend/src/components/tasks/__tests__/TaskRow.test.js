import { render, screen } from '@testing-library/react';
import TaskRow from '../TaskRow';
import { createLogger } from '../../../utils/logger';

// Mock logger to prevent console output during tests
jest.mock('../../../utils/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  })
}));

describe('TaskRow', () => {
  const testTask = {
    _id: '1',
    name: 'Test Task',
    completed: false,
    priority: 'Medium',
    dueDate: '2023-12-31',
    assignee: 'John Doe'
  };

  const mockCallbacks = {
    toggleCompletion: jest.fn(),
    handleDelete: jest.fn(),
    startEditing: jest.fn()
  };

  const priorityColors = {
    Low: 'low-priority',
    Medium: 'medium-priority',
    High: 'high-priority'
  };

  const isOverdue = jest.fn().mockReturnValue(false);

  it('renders task name and basic information', () => {
    render(
      <TaskRow
        task={testTask}
        isOverdue={isOverdue}
        priorityColors={priorityColors}
        callbacks={mockCallbacks}
      />
    );
    
    // Verify core task information is displayed
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('12/31/2023')).toBeInTheDocument();
    
    // Verify checkbox state
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    // Verify action buttons are present
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
