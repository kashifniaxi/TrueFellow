const COLORS = {
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[35m',  // magenta
  reset: '\x1b[0m',
};

const timestamp = () => new Date().toISOString();

const format = (level, message, meta) => {
  const color = COLORS[level] || '';
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${color}[${timestamp()}] [${level.toUpperCase()}]${COLORS.reset} ${message}${metaStr}`;
};

const logger = {
  info:  (msg, meta) => console.log(format('info', msg, meta)),
  warn:  (msg, meta) => console.warn(format('warn', msg, meta)),
  error: (msg, meta) => console.error(format('error', msg, meta)),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(format('debug', msg, meta));
    }
  },
};

export default logger;
