import { EventEmitter } from 'events';

interface RAGDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  timestamp: Date;
}

export class RAGStore extends EventEmitter {
  private documents: Map<string, RAGDocument> = new Map();
  private index: Map<string, Set<string>> = new Map();

  async indexDocument(doc: Omit<RAGDocument, 'id' | 'timestamp'>): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const document: RAGDocument = {
      id,
      ...doc,
      timestamp: new Date()
    };

    this.documents.set(id, document);

    const tokens = this.tokenize(doc.content);
    tokens.forEach(token => {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }
      this.index.get(token)!.add(id);
    });

    this.emit('document_indexed', { id, document });
    return id;
  }

  async search(query: string, limit: number = 10): Promise<RAGDocument[]> {
    const tokens = this.tokenize(query);
    const scores = new Map<string, number>();

    tokens.forEach(token => {
      const docIds = this.index.get(token);
      if (docIds) {
        docIds.forEach(docId => {
          scores.set(docId, (scores.get(docId) || 0) + 1);
        });
      }
    });

    const sortedDocs = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([docId]) => this.documents.get(docId)!)
      .filter(doc => doc !== undefined);

    return sortedDocs;
  }

  async getDocument(id: string): Promise<RAGDocument | undefined> {
    return this.documents.get(id);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const doc = this.documents.get(id);
    if (!doc) return false;

    this.documents.delete(id);

    const tokens = this.tokenize(doc.content);
    tokens.forEach(token => {
      const docIds = this.index.get(token);
      if (docIds) {
        docIds.delete(id);
        if (docIds.size === 0) {
          this.index.delete(token);
        }
      }
    });

    this.emit('document_deleted', { id });
    return true;
  }

  async updateDocument(id: string, updates: Partial<RAGDocument>): Promise<boolean> {
    const doc = this.documents.get(id);
    if (!doc) return false;

    if (updates.content && updates.content !== doc.content) {
      await this.deleteDocument(id);
      await this.indexDocument({
        content: updates.content,
        metadata: updates.metadata || doc.metadata
      });
    } else {
      Object.assign(doc, updates);
      this.documents.set(id, doc);
    }

    this.emit('document_updated', { id, updates });
    return true;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  getStats(): { totalDocuments: number; totalTokens: number } {
    return {
      totalDocuments: this.documents.size,
      totalTokens: this.index.size
    };
  }

  clear(): void {
    this.documents.clear();
    this.index.clear();
    this.emit('store_cleared');
  }
}