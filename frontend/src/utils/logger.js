const LOG_LEVELS = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4
};

const getLogLevel = (componentName) => {
  const envVar = `REACT_APP_COMPONENT_LOGGING_${componentName.toUpperCase()}`;
  const level = process.env[envVar]?.toUpperCase();
  return LOG_LEVELS[level] || LOG_LEVELS.ERROR; // Default to ERROR level
};

const createLogger = (componentName) => {
  const componentLevel = getLogLevel(componentName);
  
  return {
    debug: (...args) => {
      if (componentLevel <= LOG_LEVELS.DEBUG) {
        console.debug(`[${componentName}]`, ...args);
      }
    },
    info: (...args) => {
      if (componentLevel <= LOG_LEVELS.INFO) {
        console.info(`[${componentName}]`, ...args);
      }
    },
    warn: (...args) => {
      if (componentLevel <= LOG_LEVELS.WARN) {
        console.warn(`[${componentName}]`, ...args);
      }
    },
    error: (...args) => {
      if (componentLevel <= LOG_LEVELS.ERROR) {
        console.error(`[${componentName}]`, ...args);
      }
    }
  };
};

// Remove these exports since we're creating loggers in each component
