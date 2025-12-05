import { EventEmitter } from 'events';

interface QueueMessage {
  id: string;
  topic: string;
  payload: any;
  timestamp: Date;
  attempts: number;
  maxAttempts: number;
}

export class MessageQueue extends EventEmitter {
  private queues: Map<string, QueueMessage[]> = new Map();
  private processing: Map<string, boolean> = new Map();
  private handlers: Map<string, (message: any) => Promise<void>> = new Map();

  subscribe(topic: string, handler: (message: any) => Promise<void>): void {
    this.handlers.set(topic, handler);
    
    if (!this.queues.has(topic)) {
      this.queues.set(topic, []);
    }
    
    if (!this.processing.get(topic)) {
      this.startProcessing(topic);
    }
  }

  async publish(topic: string, payload: any, maxAttempts: number = 3): Promise<string> {
    const message: QueueMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic,
      payload,
      timestamp: new Date(),
      attempts: 0,
      maxAttempts
    };

    if (!this.queues.has(topic)) {
      this.queues.set(topic, []);
    }

    this.queues.get(topic)!.push(message);
    this.emit('message_published', { topic, messageId: message.id });

    return message.id;
  }

  private startProcessing(topic: string): void {
    this.processing.set(topic, true);

    const processNext = async () => {
      if (!this.processing.get(topic)) return;

      const queue = this.queues.get(topic);
      const handler = this.handlers.get(topic);

      if (!queue || !handler || queue.length === 0) {
        setTimeout(processNext, 100);
        return;
      }

      const message = queue.shift()!;

      try {
        await handler(message.payload);
        this.emit('message_processed', { topic, messageId: message.id });
      } catch (error) {
        message.attempts++;

        if (message.attempts < message.maxAttempts) {
          queue.push(message);
          this.emit('message_retry', { topic, messageId: message.id, attempts: message.attempts });
        } else {
          this.emit('message_failed', { topic, messageId: message.id, error });
        }
      }

      setImmediate(processNext);
    };

    processNext();
  }

  stopProcessing(topic: string): void {
    this.processing.set(topic, false);
  }

  getQueueSize(topic: string): number {
    return this.queues.get(topic)?.length || 0;
  }

  clearQueue(topic: string): void {
    this.queues.set(topic, []);
    this.emit('queue_cleared', { topic });
  }

  getAllTopics(): string[] {
    return Array.from(this.queues.keys());
  }
}