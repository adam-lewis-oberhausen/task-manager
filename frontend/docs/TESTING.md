# Frontend Testing Guide

This document outlines the testing strategy, tools, and best practices for the frontend codebase.

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Testing Tools](#testing-tools)
3. [Writing Unit Tests](#writing-unit-tests)
4. [Writing Integration Tests](#writing-integration-tests)
5. [Mocking API Calls](#mocking-api-calls)
6. [Testing Best Practices](#testing-best-practices)
7. [Running Tests](#running-tests)
8. [Code Coverage](#code-coverage)

## Testing Strategy

We follow a **component-first approach** with the following distribution:
- **Unit Tests**: 70% coverage (components, hooks, utilities)
- **Integration Tests**: 20% coverage (component interactions)
- **End-to-End Tests**: 10% coverage (user flows)

### Testing Pyramid
1. **Unit Tests**: Test individual components, hooks, and utilities in isolation.
2. **Integration Tests**: Test how components work together.
3. **End-to-End Tests**: Test complete user flows.

## Testing Tools

### Core Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: For component testing
- **MSW (Mock Service Worker)**: For mocking API calls
- **@testing-library/user-event**: For simulating user interactions

### Additional Tools
- **Jest DOM**: Custom Jest matchers for DOM assertions
- **React Test Renderer**: For snapshot testing

## Writing Unit Tests

### Component Tests
1. **Test Rendering**: Verify that components render correctly.
2. **Test Props**: Ensure components handle props as expected.
3. **Test Events**: Simulate user interactions (clicks, input changes).

Example:
```javascript
import { render, screen } from '@testing-library/react';
import TaskRow from '../components/TaskRow';

describe('TaskRow', () => {
  it('renders task name', () => {
    render(<TaskRow task={{ name: 'Test Task' }} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Hook Tests
1. **Test State Changes**: Verify state updates correctly.
2. **Test Effects**: Ensure side effects work as expected.

Example:
```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useTasks } from '../hooks/useTasks';

describe('useTasks', () => {
  it('initializes with empty tasks', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toEqual([]);
  });
});
```

### Utility Tests
1. **Test Pure Functions**: Verify output for given inputs.
2. **Test Edge Cases**: Handle invalid inputs gracefully.

Example:
```javascript
import { isOverdue } from '../utils/taskHelpers';

describe('isOverdue', () => {
  it('returns true for past due dates', () => {
    expect(isOverdue('2022-01-01')).toBe(true);
  });
});
```

## Writing Integration Tests

1. **Test Component Interactions**: Verify how components work together.
2. **Test Data Flow**: Ensure props and state are passed correctly.

Example:
```javascript
import { render, screen } from '@testing-library/react';
import TaskList from '../components/TaskList';

describe('TaskList Integration', () => {
  it('renders multiple TaskRow components', () => {
    render(<TaskList />);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
  });
});
```

## Mocking API Calls

We use **MSW (Mock Service Worker)** to mock API calls in tests.

### Setup
1. Create `mocks/server.js`:
```javascript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

2. Create `mocks/handlers.js`:
```javascript
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{ _id: '1', name: 'Test Task' }])
    );
  }),
];
```

3. Update `setupTests.js`:
```javascript
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it.
2. **Use Descriptive Test Names**: Clearly describe what each test verifies.
3. **Keep Tests Isolated**: Each test should work independently.
4. **Avoid Testing Implementation Details**: Don't test private methods or internal state.
5. **Use Mocks Sparingly**: Only mock what's necessary.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
npm test path/to/test/file.js
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Code Coverage

We aim for:
- **Critical Components**: 90%+ coverage
- **All Components**: 80%+ coverage
- **Utilities**: 100% coverage

### Coverage Reports
- Generated in `coverage/` directory after running tests with `--coverage` flag.
- View HTML report: Open `coverage/lcov-report/index.html` in your browser.
