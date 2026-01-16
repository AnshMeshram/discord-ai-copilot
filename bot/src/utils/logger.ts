const LOG_LEVELS = {
  info: "[ℹ️  INFO]",
  warn: "[⚠️  WARN]",
  error: "[❌ ERROR]",
  success: "[✅ SUCCESS]",
};

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`${LOG_LEVELS.info} [${timestamp()}] ${message}`, data || "");
  },

  warn: (message: string, data?: unknown) => {
    console.warn(`${LOG_LEVELS.warn} [${timestamp()}] ${message}`, data || "");
  },

  error: (message: string, data?: unknown) => {
    console.error(
      `${LOG_LEVELS.error} [${timestamp()}] ${message}`,
      data || ""
    );
  },

  success: (message: string, data?: unknown) => {
    console.log(
      `${LOG_LEVELS.success} [${timestamp()}] ${message}`,
      data || ""
    );
  },
};
