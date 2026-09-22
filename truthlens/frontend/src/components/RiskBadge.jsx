import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, ShieldAlert, ShieldCheck, Tag, Info } from 'lucide-react';

/**
 * RiskBadge — handles exact spec risk strings: "High Risk" | "Normal"
 */
export function RiskBadge({ level }) {
  const isHigh = level === 'High Risk';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
        isHigh
          ? 'bg-red-100 text-red-800 border border-red-300'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}
    >
      {isHigh ? (
        <>
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          High Risk
        </>
      ) : (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Normal
        </>
      )}
    </span>
  );
}

/**
 * StatusBadge — handles exact spec status strings:
 * "Unverified" | "Verified True" | "False" | "Misleading"
 * Badge text matches spec literal strings exactly.
 */
export function StatusBadge({ status }) {
  switch (status) {
    case 'Verified True':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Verified True
        </span>
      );
    case 'False':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          False
        </span>
      );
    case 'Misleading':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
          Misleading
        </span>
      );
    case 'Unverified':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 border border-amber-600 shadow-sm animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-950" />
          Unverified
        </span>
      );
  }
}

/**
 * FlagChip — accepts { type, reason } objects (spec format).
 * Always shows reason text, never just a bare label.
 */
export function FlagChip({ flag, showReason = true }) {
  // flag is { type: string, reason: string }
  const type = typeof flag === 'object' ? flag.type : flag;
  const reason = typeof flag === 'object' ? flag.reason : '';

  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  if (type === 'Sensational') colorStyle = 'bg-orange-50 text-orange-800 border-orange-200';
  else if (type === 'Shouting') colorStyle = 'bg-purple-50 text-purple-800 border-purple-200';
  else if (type === 'Unsourced') colorStyle = 'bg-amber-50 text-amber-800 border-amber-200';

  if (!showReason) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium border ${colorStyle}`}
        title={reason}
      >
        <Tag className="w-3 h-3 opacity-70 flex-shrink-0" />
        {type}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-col gap-0.5 px-2.5 py-1 rounded text-xs font-medium border ${colorStyle}`}
      title={reason}
    >
      <span className="flex items-center gap-1">
        <Tag className="w-3 h-3 opacity-70 flex-shrink-0" />
        {type}
      </span>
      {reason && (
        <span className="text-[10px] opacity-75 font-normal pl-4">{reason}</span>
      )}
    </span>
  );
}
