export class Formatters {
  static formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static formatRiskScore(score: number): { level: string; color: string } {
    if (score >= 70) return { level: 'Critical', color: '#dc2626' };
    if (score >= 50) return { level: 'High', color:'#ef4444' };
if (score >= 30) return { level: 'Medium', color: '#f59e0b' };
return { level: 'Low', color: '#10b981' };
}
static formatCode(code: string, language: string): string {
const lines = code.split('\n');
return lines
.map((line, index) => ${(index + 1).toString().padStart(4, ' ')} | ${line})
.join('\n');
}
static truncate(text: string, maxLength: number): string {
if (text.length <= maxLength) return text;
return text.substring(0, maxLength - 3) + '...';
}
}