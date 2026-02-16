import { Bot } from 'lucide-react';

export default function AiRouting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI & Routing</h1>
        <p className="text-slate-500 mt-1">Configure AI assistant behavior and lead routing rules</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <Bot className="mx-auto text-slate-300" size={48} />
        <p className="text-slate-500 mt-4">AI & Routing configuration coming soon.</p>
      </div>
    </div>
  );
}
