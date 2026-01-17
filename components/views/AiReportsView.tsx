import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Users, 
  Download, 
  RefreshCcw,
  CheckCircle2,
  BrainCircuit,
  PieChart,
  Calendar,
  BarChart3,
  Activity,
  Shield,
  ShieldAlert,
  Target,
  Clock,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAppConfig } from '../../contexts/AppConfigContext';
import { useToast } from '../Toast';

interface AiReportsViewProps {
  allPackages: any[];
  visitorLogs: any[];
  allOccurrences: any[];
  allNotes: any[];
  dayReservations: any[];
}

const AiReportsView: React.FC<AiReportsViewProps> = ({
  allPackages,
  visitorLogs,
  allOccurrences,
  allNotes,
  dayReservations
}) => {
  const { config } = useAppConfig();
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous'>('current');

  // Cálculos de métricas
  const metrics = useMemo(() => {
    const totalVisitors = visitorLogs.length;
    const activeVisitors = visitorLogs.filter(v => v.status === 'active').length;
    const totalPackages = allPackages.length;
    const pendingPackages = allPackages.filter(p => p.status === 'Pendente').length;
    const deliveredPackages = allPackages.filter(p => p.status === 'Entregue').length;
    const openOccurrences = allOccurrences.filter(o => o.status === 'Aberto').length;
    const resolvedOccurrences = allOccurrences.filter(o => o.status === 'Resolvido').length;
    const totalOccurrences = allOccurrences.length;
    const resolutionRate = totalOccurrences > 0 ? Math.round((resolvedOccurrences / totalOccurrences) * 100) : 100;
    const pendingNotes = allNotes.filter(n => !n.completed).length;

    return {
      totalVisitors,
      activeVisitors,
      totalPackages,
      pendingPackages,
      deliveredPackages,
      openOccurrences,
      resolvedOccurrences,
      totalOccurrences,
      resolutionRate,
      pendingNotes,
      totalReservations: dayReservations.length
    };
  }, [visitorLogs, allPackages, allOccurrences, allNotes, dayReservations]);

  // Helper para tratar erros da API Gemini
  const handleApiError = (error: any, retryCount = 0): { shouldRetry: boolean; retryDelay?: number; message?: string } => {
    // Verificar se é erro 429 (quota exceeded)
    const isQuotaError = error?.error?.code === 429 || 
                        error?.code === 429 || 
                        error?.status === 'RESOURCE_EXHAUSTED' ||
                        error?.error?.status === 'RESOURCE_EXHAUSTED' ||
                        (error?.error?.message && error.error.message.includes('exceeded your current quota'));
    
    if (isQuotaError) {
      const details = error?.error?.details || error?.details || [];
      const retryInfo = details.find((d: any) => 
        d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' || 
        d.retryDelay
      );
      
      const retryDelay = retryInfo?.retryDelay || error?.error?.details?.find((d: any) => d.retryDelay)?.retryDelay;
      const delaySeconds = retryDelay ? Math.ceil(parseFloat(String(retryDelay))) : 10;
      
      // Tentar retry automaticamente até 2 vezes
      if (retryCount < 2) {
        return { 
          shouldRetry: true, 
          retryDelay: delaySeconds * 1000, // Converter para ms
          message: `Cota da API excedida. Tentando novamente em ${delaySeconds}s... (${retryCount + 1}/2)`
        };
      }
      
      return {
        shouldRetry: false,
        message: '⚠️ Cota diária da API Gemini excedida.\n\nPor favor, aguarde algumas horas ou atualize seu plano da API do Google.\n\nPara mais informações:\n• https://ai.google.dev/gemini-api/docs/rate-limits\n• https://ai.dev/rate-limit'
      };
    }
    
    // Outros erros - extrair mensagem formatada
    let errorMessage = '';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'Erro ao conectar com a Inteligência Artificial. Verifique sua conexão e tente novamente.';
    }
    
    // Limpar mensagens de erro muito longas ou com JSON
    if (errorMessage.length > 500 || errorMessage.includes('{"error":')) {
      errorMessage = 'Erro ao gerar relatório. Por favor, verifique sua conexão e tente novamente.';
    }
    
    return {
      shouldRetry: false,
      message: errorMessage
    };
  };

  const handleGenerateReport = async (retryCount = 0) => {
    setIsGenerating(true);
    setReportContent(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const dataContext = `
        DADOS DO PERÍODO:
        - Total Visitantes: ${metrics.totalVisitors} (Ativos agora: ${metrics.activeVisitors})
        - Total Encomendas: ${metrics.totalPackages} (Pendentes: ${metrics.pendingPackages}, Entregues: ${metrics.deliveredPackages})
        - Ocorrências: ${metrics.totalOccurrences} (Abertas: ${metrics.openOccurrences}, Resolvidas: ${metrics.resolvedOccurrences})
        - Taxa de Resolução: ${metrics.resolutionRate}%
        - Reservas de Área Comum: ${metrics.totalReservations}
        - Notas Pendentes: ${metrics.pendingNotes}
        
        DETALHES OCORRÊNCIAS:
        ${allOccurrences.map(o => `- ${o.description} (Status: ${o.status}, Unidade: ${o.unit})`).join('\n')}

        NOTAS OPERACIONAIS PENDENTES:
        ${allNotes.filter(n => !n.completed).map(n => `- ${n.content} (${n.category || 'Geral'})`).join('\n')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
          Atue como um Especialista em Gestão Condominial Sênior (Síndico Profissional).
          Analise os dados brutos abaixo coletados pelo sistema de portaria e gere um RELATÓRIO EXECUTIVO PARA ASSEMBLEIA.
          
          Estrutura Obrigatória do Relatório (Use Markdown):
          1. **Resumo Executivo**: Um parágrafo sobre a "saúde" operacional do prédio.
          2. **Destaques de Segurança**: Analise as ocorrências e visitantes. Identifique riscos.
          3. **Eficiência Logística**: Analise o fluxo de encomendas. Sugira melhorias se houver muitos pendentes.
          4. **Manutenção & Zeladoria**: Baseado nas notas e ocorrências.
          5. **Sugestão de Pauta**: 3 tópicos prioritários para discutir na próxima assembleia baseados nestes dados.

          Tom de voz: Formal, Objetivo, Imparcial e Focado em Soluções.

          DADOS:
          ${dataContext}
        `,
      });

      const content = response.text || "Não foi possível gerar o relatório.";
      
      // Verificar se o conteúdo contém JSON de erro (não deveria acontecer, mas por segurança)
      if (content.includes('{"error":') || content.includes('"code":429')) {
        // Se o conteúdo contém erro, tratar como erro
        const errorInfo = handleApiError({ error: { code: 429 } }, retryCount);
        const errorMessage = errorInfo.message || 'Erro ao gerar relatório. Por favor, tente novamente.';
        setReportContent(errorMessage);
        setIsError(true);
        toast.error('Cota da API excedida. Verifique seu plano do Google Gemini API.');
        return;
      }
      
      setReportContent(content);
      setIsError(false);
      
      // Mostrar sucesso se retry funcionou
      if (retryCount > 0) {
        toast.success('Relatório gerado com sucesso após retry!');
      }
    } catch (error: any) {
      console.error('Error in handleGenerateReport:', error);
      
      // Parse do erro se for uma string JSON ou objeto serializado
      let parsedError = error;
      if (typeof error === 'string') {
        try {
          // Tentar parsear se for JSON stringificado
          parsedError = JSON.parse(error);
        } catch {
          // Se não for JSON válido, verificar se contém JSON no meio
          if (error.includes('{"error":')) {
            // Extrair apenas a parte do erro se estiver embutida em texto
            const jsonMatch = error.match(/\{"error":\{.*?\}\}/s);
            if (jsonMatch) {
              try {
                parsedError = JSON.parse(jsonMatch[0]);
              } catch {
                parsedError = { message: error.replace(/\{"error":\{.*?\}\}/s, '').trim() || 'Erro ao gerar relatório' };
              }
            } else {
              parsedError = { message: error };
            }
          } else {
            parsedError = { message: error };
          }
        }
      } else if (error && typeof error === 'object') {
        // Se já é um objeto, verificar se tem a estrutura esperada
        parsedError = error;
      } else {
        parsedError = { message: String(error) || 'Erro desconhecido' };
      }
      
      const errorInfo = handleApiError(parsedError, retryCount);
      
      if (errorInfo.shouldRetry && errorInfo.retryDelay) {
        // Mostrar toast informativo
        toast.warning(errorInfo.message || 'Aguardando antes de tentar novamente...');
        
        // Retry após delay (manter isGenerating como true durante o retry)
        setTimeout(() => {
          handleGenerateReport(retryCount + 1);
        }, errorInfo.retryDelay);
        return; // Não chamar setIsGenerating(false) aqui, pois vamos tentar novamente
      }
      
      // Erro final - mostrar mensagem formatada ao usuário
      const errorMessage = errorInfo.message || 'Erro ao conectar com a Inteligência Artificial. Verifique sua conexão e tente novamente.';
      
      // Garantir que não seja o objeto JSON completo
      const cleanMessage = typeof errorMessage === 'string' 
        ? errorMessage 
        : 'Erro ao gerar relatório. Por favor, tente novamente.';
      
      // Limpar qualquer JSON que possa estar no conteúdo
      let finalMessage = cleanMessage;
      
      // Remover qualquer JSON de erro que possa estar no texto
      finalMessage = finalMessage.replace(/\{"error":\{[^}]*\}\}/g, '');
      finalMessage = finalMessage.replace(/\\n/g, '\n');
      finalMessage = finalMessage.trim();
      
      // Se ainda contém JSON ou código de erro, substituir por mensagem formatada
      if (finalMessage.includes('"code":429') || 
          finalMessage.includes('"status":"RESOURCE_EXHAUSTED"') ||
          finalMessage.includes('quota exceeded') ||
          (finalMessage.includes('429') && finalMessage.length > 200)) {
        finalMessage = '⚠️ Cota diária da API Gemini excedida.\n\nPor favor, aguarde algumas horas ou atualize seu plano da API do Google.\n\nPara mais informações:\n• https://ai.google.dev/gemini-api/docs/rate-limits\n• https://ai.dev/rate-limit';
      } else if (finalMessage.includes('{"error":') || finalMessage.length > 1000) {
        // Se ainda contém JSON ou mensagem muito longa, usar mensagem padrão
        finalMessage = 'Erro ao gerar relatório. Por favor, verifique sua conexão e tente novamente.';
      }
      
      // Garantir que não está vazia
      if (!finalMessage || finalMessage.trim().length === 0) {
        finalMessage = 'Erro ao gerar relatório. Por favor, tente novamente.';
      }
      
      setReportContent(finalMessage);
      setIsError(true); // Marcar como erro
      
      // Mostrar toast de erro
      if (finalMessage.includes('Cota diária') || finalMessage.includes('Cota da API') || finalMessage.includes('quota')) {
        toast.error('Cota da API excedida. Verifique seu plano do Google Gemini API.');
      } else {
        toast.error('Erro ao gerar relatório');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportContent || isError) {
      toast.warning('Gere um relatório válido primeiro antes de exportar.');
      return;
    }

    // Criar conteúdo HTML formatado para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório Executivo - ${config.condominiumName}</title>
          <style>
            @page {
              margin: 2cm;
              size: A4;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              max-width: 210mm;
              margin: 0 auto;
              padding: 20mm;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 24px;
              font-weight: 900;
              text-transform: uppercase;
              margin: 0;
              letter-spacing: 2px;
            }
            .header .subtitle {
              font-size: 12px;
              margin-top: 8px;
              opacity: 0.7;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .metadata {
              margin: 20px 0;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 8px;
              font-size: 11px;
            }
            .metadata p {
              margin: 5px 0;
            }
            .content {
              margin-top: 30px;
              font-size: 12px;
              line-height: 1.8;
            }
            .content h2 {
              font-size: 16px;
              font-weight: 800;
              margin-top: 25px;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 2px solid #000;
              padding-bottom: 5px;
            }
            .content h3 {
              font-size: 14px;
              font-weight: 700;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .content p {
              margin: 10px 0;
              text-align: justify;
            }
            .content ul, .content ol {
              margin: 10px 0;
              padding-left: 25px;
            }
            .content li {
              margin: 5px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 10px;
              text-align: center;
              opacity: 0.6;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Executivo</h1>
            <div class="subtitle">Preparatório para Assembleia</div>
            <div class="subtitle">${config.condominiumName}</div>
          </div>
          
          <div class="metadata">
            <p><strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Período:</strong> ${selectedPeriod === 'current' ? 'Mês Atual' : 'Mês Anterior'}</p>
            <p><strong>Métricas:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px; font-size: 10px;">
              <li>Visitantes Totais: ${metrics.totalVisitors} (${metrics.activeVisitors} ativos agora)</li>
              <li>Encomendas: ${metrics.totalPackages} (${metrics.pendingPackages} pendentes, ${metrics.deliveredPackages} entregues)</li>
              <li>Ocorrências: ${metrics.totalOccurrences} (${metrics.openOccurrences} abertas, ${metrics.resolvedOccurrences} resolvidas)</li>
              <li>Taxa de Resolução: ${metrics.resolutionRate}%</li>
              <li>Reservas: ${metrics.totalReservations}</li>
              <li>Notas Pendentes: ${metrics.pendingNotes}</li>
            </ul>
          </div>
          
          <div class="content">
            ${reportContent
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')}
          </div>
          
          <div class="footer">
            <p>Documento gerado pelo Sistema de Gestão Condominial Qualivida</p>
            <p>Este relatório é confidencial e destinado exclusivamente aos membros da assembleia</p>
          </div>
        </body>
      </html>
    `;

    // Criar nova janela e adicionar conteúdo
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para exportar o PDF.');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* HEADER MODERNO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-lg">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-contrast-high">
                Relatórios Inteligentes
              </h2>
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-contrast-low mt-1">
                Análise IA para Assembleias • {config.condominiumName}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 premium-glass p-1 rounded-2xl border border-[var(--border-color)]">
          <button
            onClick={() => setSelectedPeriod('current')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedPeriod === 'current'
                ? 'bg-[var(--text-primary)] text-[var(--bg-color)] shadow-lg'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setSelectedPeriod('previous')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedPeriod === 'previous'
                ? 'bg-[var(--text-primary)] text-[var(--bg-color)] shadow-lg'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Mês Anterior
          </button>
        </div>
      </header>

      {/* KPIs PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-glass rounded-[24px] p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              +12%
            </span>
          </div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] mb-1">
            {metrics.totalVisitors}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Acessos Totais
          </p>
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">
              {metrics.activeVisitors} Ativos Agora
            </span>
          </div>
        </div>

        <div className="premium-glass rounded-[24px] p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              Estável
            </span>
          </div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] mb-1">
            {metrics.totalPackages}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Volumes Recebidos
          </p>
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
            <div className={`w-2 h-2 rounded-full ${metrics.pendingPackages > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">
              {metrics.pendingPackages} Aguardando
            </span>
          </div>
        </div>

        <div className={`premium-glass rounded-[24px] p-6 border ${
          metrics.openOccurrences > 0 ? 'border-red-500/20' : 'border-[var(--border-color)]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {metrics.openOccurrences > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-1 rounded-lg animate-pulse">
                Atenção
              </span>
            )}
          </div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] mb-1">
            {metrics.totalOccurrences}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Ocorrências Totais
          </p>
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
            <div className={`w-2 h-2 rounded-full ${metrics.openOccurrences > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">
              {metrics.openOccurrences} Em Aberto
            </span>
          </div>
          </div>

        <div className="premium-glass rounded-[24px] p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              Taxa
            </span>
          </div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] mb-1">
            {metrics.resolutionRate}%
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Resolução de Ocorrências
          </p>
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">
              {metrics.resolvedOccurrences} Resolvidas
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE RELATÓRIO */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Área Principal do Relatório */}
        <div className="flex-1 premium-glass rounded-[32px] p-8 border border-[var(--border-color)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FileText className="w-64 h-64 text-[var(--text-primary)]" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-contrast-high">
                  Relatório Executivo
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-2">
                  Preparatório para Assembleia
                </p>
              </div>
              {!isGenerating && !reportContent && (
                <button
                  onClick={handleGenerateReport}
                  className="group px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                  Gerar com IA
                </button>
              )}
            </div>

            {isGenerating && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[var(--border-color)] border-t-[var(--text-primary)] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-[var(--text-primary)] animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-contrast-high">
                    Processando Dados
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-2">
                    Analisando ocorrências e métricas...
                  </p>
                </div>
              </div>
            )}

            {reportContent && !isGenerating && (
              <div className="animate-in slide-in-from-bottom-8 duration-700">
                <div className="premium-glass p-8 rounded-[24px] border border-[var(--border-color)] mb-6 relative">
                  <button
                    onClick={() => {
                      setReportContent(null);
                      setIsError(false);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]/80 transition-all z-10"
                    title="Fechar relatório"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isError ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-lg font-black uppercase text-red-400 mb-2">Erro ao Gerar Relatório</h4>
                          <div className="text-sm font-medium text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                            {reportContent}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <p className="text-xs font-bold text-amber-400 mb-2">O que você pode fazer:</p>
                        <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                          <li>Aguarde algumas horas para a cota da API ser renovada</li>
                          <li>Verifique seu plano do Google Gemini API</li>
                          <li>Tente novamente mais tarde</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-line leading-relaxed font-medium text-[var(--text-primary)]">
                      {reportContent}
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setReportContent(null);
                      setIsError(false);
                      handleGenerateReport();
                    }}
                    className="px-6 py-3 bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[var(--glass-bg)]/80 transition-all flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {isError ? 'Tentar Novamente' : 'Regenerar'}
                  </button>
                  {!isError && (
                    <button
                      onClick={handleExportPDF}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar PDF
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isGenerating && !reportContent && (
              <div className="py-12 border-2 border-dashed border-[var(--border-color)] rounded-[24px] flex flex-col items-center justify-center text-center opacity-40">
                <PieChart className="w-12 h-12 mb-4 text-[var(--text-secondary)]" />
                <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Nenhum relatório gerado ainda
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  Clique em "Gerar com IA" para criar um relatório executivo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar de Insights */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="premium-glass rounded-[24px] p-6 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-black uppercase text-xs tracking-widest">
                Alertas da IA
              </h4>
            </div>
            <div className="space-y-3">
              {metrics.pendingPackages > 10 && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <p className="text-xs font-bold text-amber-200 leading-tight">
                    Acúmulo de encomendas detectado. Considere emitir alerta aos moradores.
                  </p>
                </div>
              )}
              {metrics.openOccurrences > 2 && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-xs font-bold text-red-300 leading-tight">
                    Ocorrências de segurança acima da média. Requer atenção imediata.
                  </p>
                </div>
              )}
              {metrics.activeVisitors > 5 && (
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs font-bold text-blue-300 leading-tight">
                    Alto fluxo de visitantes detectado. Portaria pode estar sobrecarregada.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="premium-glass rounded-[24px] p-6 border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-4 text-[var(--text-primary)]">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="font-black uppercase text-xs tracking-widest">
                Pontos Positivos
              </h4>
            </div>
            <ul className="space-y-3">
              {metrics.resolutionRate >= 80 && (
                <li className="flex items-start gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>Taxa de resolução de ocorrências excelente ({metrics.resolutionRate}%)</span>
                </li>
              )}
              {metrics.pendingPackages <= 5 && (
                <li className="flex items-start gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>Gestão de encomendas eficiente</span>
                </li>
              )}
              <li className="flex items-start gap-2 text-xs font-medium text-[var(--text-secondary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>Sistema operacional estável e funcional</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <toast.ToastContainer />
    </div>
  );
};

export default AiReportsView;
