import { rest } from 'msw';

export const handlers = [
  // Add your API mock handlers here
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          _id: '1',
          name: 'Test Task',
          completed: false,
          priority: 'Medium',
          dueDate: '2023-12-31',
          assignee: 'John Doe'
        }
      ])
    );
  })
];
