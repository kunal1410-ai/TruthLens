import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Volume2,
  HelpCircle
} from 'lucide-react';

/**
 * RiskBadge — handles exact spec risk strings: "High Risk" | "Normal"
 */
export function RiskBadge({ level }) {
  const isHigh = level === 'High Risk';
  return (
    <span
      className={`risk-badge ${isHigh ? 'risk-badge-high' : 'risk-badge-normal'}`}
      title={isHigh ? '2+ risk signals detected — priority triage' : 'Low risk signals detected'}
    >
      {isHigh ? (
        <>
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span>High Risk</span>
        </>
      ) : (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Normal</span>
        </>
      )}
    </span>
  );
}

/**
 * StatusBadge — handles exact spec status strings:
 * "Unverified" | "Verified True" | "False" | "Misleading"
 */
export function StatusBadge({ status }) {
  switch (status) {
    case 'Verified True':
      return (
        <span className="status-badge status-badge-true">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Verified True</span>
        </span>
      );
    case 'False':
      return (
        <span className="status-badge status-badge-false">
          <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          <span>False</span>
        </span>
      );
    case 'Misleading':
      return (
        <span className="status-badge status-badge-misleading">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Misleading</span>
        </span>
      );
    case 'Unverified':
    default:
      return (
        <span className="status-badge status-badge-unverified">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
          <span>Unverified</span>
        </span>
      );
  }
}

/**
 * FlagChip — accepts { type, reason } objects (spec format).
 * Always shows reason text, never just a bare label.
 */
export function FlagChip({ flag }) {
  const type = typeof flag === 'object' ? flag.type : flag;
  const reason = typeof flag === 'object' ? flag.reason : '';

  let chipClass = 'flag-chip-sensational';
  let Icon = Tag;

  if (type === 'Shouting') {
    chipClass = 'flag-chip-shouting';
    Icon = Volume2;
  } else if (type === 'Unsourced') {
    chipClass = 'flag-chip-unsourced';
    Icon = HelpCircle;
  } else if (type === 'Sensational') {
    chipClass = 'flag-chip-sensational';
    Icon = AlertCircle;
  }

  return (
    <span className={`flag-chip ${chipClass}`} title={reason}>
      <span className="flag-chip-title">
        <Icon className="w-3 h-3 flex-shrink-0 opacity-80" />
        {type}
      </span>
      {reason && (
        <span className="flag-chip-reason">
          {reason}
        </span>
      )}
    </span>
  );
}
