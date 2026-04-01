import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Activity, Zap, BarChart3, Loader2 } from 'lucide-react';
import {
  getAnalyticsCosts,
  type AnalyticsCostsResponse,
  type AnalyticsCostsPerConversation,
} from '../api';

function formatUsd(value: number): string {
  return `$${value.toFixed(4)}`;
}

function formatUsdShort(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string, len = 16): string {
  if (id.length <= len) return id;
  return `${id.slice(0, len)}...`;
}

type SortKey = 'total_cost_usd' | 'call_count' | 'input_tokens' | 'output_tokens';

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsCostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('total_cost_usd');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAnalyticsCosts(days)
      .then((r) => {
        if (!cancelled) setData(r.data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load cost data. Make sure the backend is running.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const sortedConversations = useMemo(() => {
    if (!data) return [];
    return [...data.per_conversation].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortAsc ? av - bv : bv - av;
    });
  }, [data, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="ml-1 text-slate-300">&#8597;</span>;
    return <span className="ml-1 text-brand-600">{sortAsc ? '\u2191' : '\u2193'}</span>;
  }

  const modelEntries = data
    ? Object.entries(data.model_split).filter(([, v]) => v.calls > 0)
    : [];
  const totalModelCost = modelEntries.reduce((sum, [, v]) => sum + v.cost_usd, 0);
  const totalModelCalls = modelEntries.reduce((sum, [, v]) => sum + v.calls, 0);

  const summary = data?.summary;

  const kpis = [
    {
      label: 'Total Spend',
      value: summary ? formatUsdShort(summary.total_spend_usd) : '\u2014',
      icon: DollarSign,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Avg Cost / Conversation',
      value: summary ? formatUsd(summary.avg_cost_per_conversation) : '\u2014',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Cache Hit Rate',
      value: summary ? formatPct(summary.cache_hit_rate) : '\u2014',
      icon: Zap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total API Calls',
      value: summary ? summary.total_calls.toLocaleString() : '\u2014',
      icon: BarChart3,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Cost Dashboard</h1>
          <p className="text-slate-500 mt-1">Claude API usage and spend breakdown</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
          {error}
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                    <div className={`${card.bg} p-2 rounded-lg`}>
                      <Icon className={card.color} size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Split */}
          {modelEntries.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Model Split</h2>
              <div className="space-y-4">
                {modelEntries.map(([model, stats]) => {
                  const costPct =
                    totalModelCost > 0 ? (stats.cost_usd / totalModelCost) * 100 : 0;
                  const callPct =
                    totalModelCalls > 0 ? (stats.calls / totalModelCalls) * 100 : 0;
                  const shortName = model.includes('haiku')
                    ? 'Haiku'
                    : model.includes('sonnet')
                    ? 'Sonnet'
                    : model;
                  const barColor = model.includes('haiku')
                    ? 'bg-emerald-500'
                    : 'bg-brand-600';
                  return (
                    <div key={model}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{shortName}</span>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>
                            {formatUsdShort(stats.cost_usd)} ({costPct.toFixed(1)}% spend)
                          </span>
                          <span>
                            {stats.calls.toLocaleString()} calls ({callPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-300`}
                          style={{ width: `${costPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily Breakdown */}
          {data.daily_breakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Daily Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Cost</th>
                      <th className="px-6 py-3 text-right">API Calls</th>
                      <th className="px-6 py-3 text-right">Cache Hit Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily_breakdown.map((row, i) => (
                      <tr
                        key={row.date}
                        className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                      >
                        <td className="px-6 py-3 font-medium text-slate-700">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-900 font-mono">
                          {formatUsd(row.cost_usd)}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-700">
                          {row.calls.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${row.cache_hit_rate * 100}%` }}
                              />
                            </div>
                            <span className="text-slate-700 w-10 text-right tabular-nums">
                              {formatPct(row.cache_hit_rate)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Per-Conversation Costs */}
          {sortedConversations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Per-Conversation Costs</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sortedConversations.length} conversations &middot; click column headers to sort
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                      <th className="px-6 py-3">Conversation</th>
                      <th
                        className="px-6 py-3 text-right cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort('total_cost_usd')}
                      >
                        Cost <SortIndicator col="total_cost_usd" />
                      </th>
                      <th
                        className="px-6 py-3 text-right cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort('call_count')}
                      >
                        Calls <SortIndicator col="call_count" />
                      </th>
                      <th
                        className="px-6 py-3 text-right cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort('input_tokens')}
                      >
                        Input Tokens <SortIndicator col="input_tokens" />
                      </th>
                      <th
                        className="px-6 py-3 text-right cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort('output_tokens')}
                      >
                        Output Tokens <SortIndicator col="output_tokens" />
                      </th>
                      <th className="px-6 py-3 text-right">Time Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedConversations.map((conv: AnalyticsCostsPerConversation, i) => (
                      <tr
                        key={conv.conversation_id}
                        className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                      >
                        <td className="px-6 py-3">
                          <span
                            className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                            title={conv.conversation_id}
                          >
                            {truncateId(conv.conversation_id)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-mono text-slate-900">
                          {formatUsd(conv.total_cost_usd)}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-700">{conv.call_count}</td>
                        <td className="px-6 py-3 text-right text-slate-700 tabular-nums">
                          {conv.input_tokens.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-700 tabular-nums">
                          {conv.output_tokens.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                          {formatTimestamp(conv.first_call)} to {formatTimestamp(conv.last_call)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.daily_breakdown.length === 0 && sortedConversations.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <p className="text-slate-500">No cost data for the selected period.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
