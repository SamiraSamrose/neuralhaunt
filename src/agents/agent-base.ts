import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface AgentConfig {
  id: string;
  name: string;
  capabilities: string[];
  maxConcurrency?: number;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification' | 'error';
  payload: any;
  timestamp: Date;
}

export interface AgentMemory {
  [key: string]: any;
}

export abstract class Agent extends EventEmitter {
  protected config: AgentConfig;
  protected memory: AgentMemory = {};
  protected running: boolean = false;
  
  constructor(config: AgentConfig) {
    super();
    this.config = config;
  }
  
  // STEP 1: Lifecycle methods
  async start(): Promise<void> {
    if (this.running) {
      throw new Error(`Agent ${this.config.id} is already running`);
    }
    
    this.running = true;
    await this.onStart();
    this.emit('started', { agentId: this.config.id });
  }
  
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }
    
    this.running = false;
    await this.onStop();
    this.emit('stopped', { agentId: this.config.id });
  }
  
  // STEP 2: Message handling
  async handleMessage(message: AgentMessage): Promise<void> {
    if (!this.running) {
      throw new Error(`Agent ${this.config.id} is not running`);
    }
    
    this.emit('message_received', message);
    
    try {
      switch (message.type) {
        case 'request':
          await this.onRequest(message);
          break;
        case 'notification':
          await this.onNotification(message);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      this.emit('error', {
        error,
        agentId: this.config.id,
        context: { message }
      });
    }
  }
  
  // STEP 3: Send messages to other agents
  protected async sendMessage(to: string, type: AgentMessage['type'], payload: any): Promise<void> {
    const message: AgentMessage = {
      id: uuidv4(),
      from: this.config.id,
      to,
      type,
      payload,
      timestamp: new Date()
    };
    
    this.emit('message_sent', message);
  }
  
  // STEP 4: Memory management
  protected setMemory(key: string, value: any): void {
    this.memory[key] = value;
    this.emit('memory_updated', {
      agentId: this.config.id,
      updateType: 'add',
      key,
      value,
      timestamp: new Date()
    });
  }
  
  protected getMemory(key: string): any {
    return this.memory[key];
  }
  
  protected clearMemory(): void {
    this.memory = {};
    this.emit('memory_cleared', { agentId: this.config.id });
  }
  
  // STEP 5: Abstract methods for subclasses
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onRequest(message: AgentMessage): Promise<void>;
  protected abstract onNotification(message: AgentMessage): Promise<void>;
  
  // STEP 6: Utility methods
  getId(): string {
    return this.config.id;
  }
  
  getName(): string {
    return this.config.name;
  }
  
  getCapabilities(): string[] {
    return [...this.config.capabilities];
  }
  
  isRunning(): boolean {
    return this.running;
  }
}
