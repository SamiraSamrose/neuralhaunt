import { ParseResult } from '../agents/legacy-parser-agent';
import { TranslationResult } from '../agents/code-translator-agent';

export class TranslationService {
  private activeTranslations: Map<string, any> = new Map();

  async startTranslation(
    projectId: string,
    sourceFile: string,
    parseResult: ParseResult,
    targetLanguage: string
  ): Promise<string> {
    const translationId = `trans_${Date.now()}`;

    this.activeTranslations.set(translationId, {
      projectId,
      sourceFile,
      targetLanguage,
      status: 'in_progress',
      startTime: new Date(),
      progress: 0
    });

    return translationId;
  }

  async getTranslationStatus(translationId: string): Promise<any> {
    return this.activeTranslations.get(translationId);
  }

  async updateProgress(translationId: string, progress: number): Promise<void> {
    const translation = this.activeTranslations.get(translationId);
    if (translation) {
      translation.progress = progress;
      translation.lastUpdate = new Date();
    }
  }

  async completeTranslation(
    translationId: string,
    result: TranslationResult
  ): Promise<void> {
    const translation = this.activeTranslations.get(translationId);
    if (translation) {
      translation.status = 'completed';
      translation.result = result;
      translation.endTime = new Date();
    }
  }

  async failTranslation(translationId: string, error: Error): Promise<void> {
    const translation = this.activeTranslations.get(translationId);
    if (translation) {
      translation.status = 'failed';
      translation.error = error.message;
      translation.endTime = new Date();
    }
  }

  getAllActiveTranslations(): any[] {
    return Array.from(this.activeTranslations.values())
      .filter(t => t.status === 'in_progress');
  }

  getTranslationHistory(projectId: string): any[] {
    return Array.from(this.activeTranslations.values())
      .filter(t => t.projectId === projectId);
  }
}