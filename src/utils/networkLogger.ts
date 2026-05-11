/**
 * Network Logger Utility
 * Logs API requests and responses for performance debugging
 */

interface RequestLog {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  success: boolean;
  error?: string;
}

class NetworkLogger {
  private logs: RequestLog[] = [];
  private enableLogging = true;

  constructor() {
    // Enable logging in development only
    this.enableLogging = import.meta.env.DEV;
  }

  logRequest(
    url: string,
    method: string = 'GET',
    startTime: number = Date.now()
  ): RequestLog {
    const log: RequestLog = {
      url,
      method,
      startTime,
      success: false,
    };
    return log;
  }

  logResponse(
    log: RequestLog,
    status: number,
    endTime: number = Date.now()
  ): RequestLog {
    log.endTime = endTime;
    log.duration = endTime - log.startTime;
    log.status = status;
    log.success = status >= 200 && status < 300;

    if (this.enableLogging) {
      const color = log.success ? 'color: green' : 'color: red';
      console.log(
        `%c[API] ${log.method} ${log.url} - ${log.status} (${log.duration}ms)`,
        color
      );
    }

    this.logs.push(log);
    return log;
  }

  logError(log: RequestLog, error: string, endTime: number = Date.now()): RequestLog {
    log.endTime = endTime;
    log.duration = endTime - log.startTime;
    log.success = false;
    log.error = error;

    if (this.enableLogging) {
      console.error(
        `%c[API ERROR] ${log.method} ${log.url} - ${error} (${log.duration}ms)`,
        'color: red'
      );
    }

    this.logs.push(log);
    return log;
  }

  getSlowRequests(threshold: number = 1000): RequestLog[] {
    return this.logs.filter(log => log.duration && log.duration > threshold);
  }

  getFailedRequests(): RequestLog[] {
    return this.logs.filter(log => !log.success);
  }

  getAllLogs(): RequestLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  printSummary(): void {
    if (!this.enableLogging) return;

    const totalRequests = this.logs.length;
    const failedRequests = this.getFailedRequests().length;
    const avgDuration =
      this.logs.reduce((sum, log) => sum + (log.duration || 0), 0) / totalRequests || 0;
    const slowRequests = this.getSlowRequests();

    console.group('📊 Network Performance Summary');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Failed: ${failedRequests}`);
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    if (slowRequests.length > 0) {
      console.log(`Slow Requests (>1s):`);
      slowRequests.forEach(log => {
        console.log(
          `  - ${log.method} ${log.url}: ${log.duration}ms`,
          log.error ? `(Error: ${log.error})` : ''
        );
      });
    }
    console.groupEnd();
  }
}

export const networkLogger = new NetworkLogger();
