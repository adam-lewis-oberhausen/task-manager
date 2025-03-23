import { render, screen, fireEvent } from '@testing-library/react';
import TaskPanel from '../TaskPanel';
import { createLogger } from '../../../utils/logger';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  })
}));

describe('TaskPanel', () => {
  const mockTask = {
    _id: '1',
    name: 'Test Task',
    description: 'Test Description',
    priority: 'Medium',
    dueDate: '2023-12-31'
  };

  const mockProject = {
    _id: 'project1',
    name: 'Test Project'
  };

  const mockCallbacks = {
    onSave: jest.fn(),
    onCancel: jest.fn()
  };

  it('renders when isOpen is true', () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    // Verify dialog is present
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'description' })).toBeInTheDocument();

    // Verify form fields are present
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByTestId('description-editor')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TaskPanel
        isOpen={false}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows edit title when editing existing task', () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    expect(screen.getByText(/edit task/i)).toBeInTheDocument();
  });

  it('shows create title when creating new task', () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={null}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    expect(screen.getByText(/create new task/i)).toBeInTheDocument();
  });

  it('passes correct task data to TaskForm', () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    expect(screen.getByDisplayValue(mockTask.name)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTask.priority)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTask.dueDate)).toBeInTheDocument();
  });

  it('passes current project to TaskForm', () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    // Verify form is present
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();

    // Verify project ID is passed to form
    expect(form).toHaveAttribute('data-project-id', mockProject._id);
  });

  it('handles missing project gracefully', () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={null}
      />
    );

    // Verify form still renders
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('calls onSave with correct data', async () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    // Simulate form submission
    const saveButton = screen.getByRole('button', { name: /save task/i });
    fireEvent.click(saveButton);

    // Verify onSave was called with correct data
    expect(mockCallbacks.onSave).toHaveBeenCalledWith(expect.objectContaining({
      _id: mockTask._id,
      name: mockTask.name,
      description: expect.stringContaining('Test Description'), // More flexible check
      priority: mockTask.priority,
      project: mockProject._id
    }));

    // Verify date is in correct format
    const savedData = mockCallbacks.onSave.mock.calls[0][0];
    expect(new Date(savedData.dueDate)).toEqual(new Date('2023-12-31'));
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TaskPanel
        isOpen={true}
        editingTask={mockTask}
        onSave={mockCallbacks.onSave}
        onCancel={mockCallbacks.onCancel}
        currentProject={mockProject}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();

    expect(mockCallbacks.onCancel).toHaveBeenCalled();
  });
});
