const createLogger = (componentName) => {
  const envVar = `REACT_APP_COMPONENT_LOGGING_${componentName.toUpperCase()}`;
  const isEnabled = process.env[envVar] === 'true';

  return {
    debug: (...args) => {
      if (isEnabled) {
        console.debug(`[${componentName}]`, ...args);
      }
    },
    info: (...args) => {
      if (isEnabled) {
        console.info(`[${componentName}]`, ...args);
      }
    },
    warn: (...args) => {
      if (isEnabled) {
        console.warn(`[${componentName}]`, ...args);
      }
    },
    error: (...args) => {
      console.error(`[${componentName}]`, ...args);
    }
  };
};

export const tasksLogger = createLogger('USE_TASKS');
export const taskListLogger = createLogger('TASK_LIST');
export const taskRowLogger = createLogger('TASK_ROW');
