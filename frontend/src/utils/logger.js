
console.log('REACT_APP_COMPONENT_LOGGING_USE_TASKS:', process.env.REACT_APP_COMPONENT_LOGGING_USE_TASKS);

export const tasksLogger = {
  debug: (...args) => {
    if (process.env.REACT_APP_COMPONENT_LOGGING_USE_TASKS === 'true') {
      console.debug('[USE_TASKS]', ...args);
    }
  },
  info: (...args) => {
    if (process.env.REACT_APP_COMPONENT_LOGGING_USE_TASKS === 'true') {
      console.info('[USE_TASKS]', ...args);
    }
  },
  warn: (...args) => {
    if (process.env.REACT_APP_COMPONENT_LOGGING_USE_TASKS === 'true') {
      console.warn('[USE_TASKS]', ...args);
    }
  },
  error: (...args) => {
    console.error('[USE_TASKS]', ...args);
  }
};
