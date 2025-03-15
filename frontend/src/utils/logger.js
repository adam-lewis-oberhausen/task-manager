
const COMPONENT_LOGGING = {
  USE_TASKS: process.env.REACT_APP_COMPONENT_LOGGING_USE_TASKS === 'true',
  // Add other components here as needed
};

const createLogger = (componentName) => {
  return {
    debug: (...args) => {
      if (COMPONENT_LOGGING[componentName]) {
        console.debug(`[${componentName}]`, ...args);
      }
    },
    info: (...args) => {
      if (COMPONENT_LOGGING[componentName]) {
        console.info(`[${componentName}]`, ...args);
      }
    },
    warn: (...args) => {
      if (COMPONENT_LOGGING[componentName]) {
        console.warn(`[${componentName}]`, ...args);
      }
    },
    error: (...args) => {
      // Always log errors regardless of logging setting
      console.error(`[${componentName}]`, ...args);
    }
  };
};

export const useTasksLogger = createLogger('USE_TASKS');
