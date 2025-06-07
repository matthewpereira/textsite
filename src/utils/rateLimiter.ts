class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private lastRequest = 0;
  private readonly minInterval: number;

  constructor(requestsPerSecond: number = 2) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;
      
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minInterval - timeSinceLastRequest)
        );
      }
      
      const request = this.queue.shift();
      if (request) {
        this.lastRequest = Date.now();
        await request();
      }
    }
    
    this.processing = false;
  }
}

export const imgurRateLimiter = new RateLimiter(2); // 2 requests per second
