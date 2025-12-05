import { AgentOrchestrator } from './lib/agent-framework';
import { LegacyParserAgent } from './agents/legacy-parser-agent';
import { CodeTranslatorAgent } from './agents/code-translator-agent';
import { TestGeneratorAgent } from './agents/test-generator-agent';
import { RiskEvaluatorAgent } from './agents/risk-evaluator-agent';

async function main() {
  console.log('NeuralHaunt: RAG-based Multi-Agent AI Ghostwriter');
  console.log('==============================================');
  console.log('');
  
  // STEP 1: Create orchestrator
  const orchestrator = new AgentOrchestrator();
  
  // STEP 2: Create agents
  const parserAgent = new LegacyParserAgent({
    id: 'legacy-parser',
    name: 'Legacy Code Parser',
    capabilities: ['parsing', 'ast-generation', 'dependency-analysis']
  });
  
  const translatorAgent = new CodeTranslatorAgent({
    id: 'code-translator',
    name: 'Code Translator',
    capabilities: ['translation', 'pattern-matching', 'idiom-generation']
  });
  
  const testAgent = new TestGeneratorAgent({
    id: 'test-generator',
    name: 'Test Generator',
    capabilities: ['test-generation', 'coverage-analysis', 'mocking']
  });
  
  const riskAgent = new RiskEvaluatorAgent({
    id: 'risk-evaluator',
    name: 'Risk Evaluator',
    capabilities: ['risk-scoring', 'pattern-detection', 'security-analysis']
  });
  
  // STEP 3: Register agents
  orchestrator.registerAgent(parserAgent);
  orchestrator.registerAgent(translatorAgent);
  orchestrator.registerAgent(testAgent);
  orchestrator.registerAgent(riskAgent);
  
  // STEP 4: Start all agents
  await orchestrator.startAll();
  
  console.log('All agents initialized and running');
  console.log('Web interface available at http://localhost:3000');
  console.log('CRM MCP Server: http://localhost:3001');
  console.log('Analytics MCP Server: http://localhost:3002');
  
  // STEP 5: Handle shutdown gracefully
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await orchestrator.stopAll();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
