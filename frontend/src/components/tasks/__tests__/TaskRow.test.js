import { render, screen, fireEvent } from '@testing-library/react';
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
      <table>
        <tbody>
          <TaskRow
            task={testTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
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

  it('toggles task completion state when checkbox is clicked', () => {
    render(
      <table>
        <tbody>
          <TaskRow
            task={testTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockCallbacks.toggleCompletion).toHaveBeenCalledWith(testTask);
  });

  it('calls startEditing when edit button is clicked', () => {
    render(
      <table>
        <tbody>
          <TaskRow
            task={testTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockCallbacks.startEditing).toHaveBeenCalled();
  });

  it('calls handleDelete when delete button is clicked and confirmed', () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);

    render(
      <table>
        <tbody>
          <TaskRow
            task={testTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const deleteButton = screen.getByRole('button', { name: /delete-task/i });
    fireEvent.click(deleteButton);

    // Verify confirm was called
    expect(window.confirm).toHaveBeenCalledWith(
      `Are you sure you want to delete "${testTask.name}"?`
    );

    // Verify delete callback was called
    expect(mockCallbacks.handleDelete).toHaveBeenCalledWith(testTask._id);
  });

  it('does not call handleDelete when delete is canceled', () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn(() => false);

    render(
      <table>
        <tbody>
          <TaskRow
            task={testTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const deleteButton = screen.getByRole('button', { name: /delete-task/i });
    fireEvent.click(deleteButton);

    // Verify confirm was called
    expect(window.confirm).toHaveBeenCalled();

    // Verify delete callback was NOT called
    expect(mockCallbacks.handleDelete).not.toHaveBeenCalled();
  });

  it('applies overdue styling when task is overdue', () => {
    const overdueTask = { ...testTask, dueDate: '2020-01-01' };
    isOverdue.mockReturnValue(true);

    render(
      <table>
        <tbody>
          <TaskRow
            task={overdueTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const row = screen.getByRole('row');
    expect(row).toHaveClass('overdueRow');
  });

  it('applies completed styling when task is completed', () => {
    const completedTask = { ...testTask, completed: true };

    render(
      <table>
        <tbody>
          <TaskRow
            task={completedTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const row = screen.getByRole('row');
    expect(row).toHaveClass('completedRow');
  });

  it('applies correct priority color class', () => {
    const highPriorityTask = { ...testTask, priority: 'High' };

    render(
      <table>
        <tbody>
          <TaskRow
            task={highPriorityTask}
            isOverdue={isOverdue}
            priorityColors={{ High: 'high-priority' }}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const priorityCell = screen.getByText('High');
    expect(priorityCell).toHaveClass('high-priority');
  });

  it('formats dates correctly', () => {
    render(
      <table>
        <tbody>
          <TaskRow
            task={testTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('12/31/2023')).toBeInTheDocument();
  });

  it('handles empty due dates gracefully', () => {
    const noDateTask = { ...testTask, dueDate: null };

    render(
      <table>
        <tbody>
          <TaskRow
            task={noDateTask}
            isOverdue={isOverdue}
            priorityColors={priorityColors}
            callbacks={mockCallbacks}
          />
        </tbody>
      </table>
    );

    const dateCell = screen.getByRole('cell', { name: 'due-date' });
    expect(dateCell).toBeInTheDocument();
  });
});
