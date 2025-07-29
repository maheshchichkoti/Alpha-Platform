// src/components/ProgressLog.tsx
import React from "react";

type ProgressEvent = {
  step: string;
  message: string;
  iteration?: number;
  query?: string;
  [key: string]: any;
};

type Props = {
  logs: ProgressEvent[];
};

export default function ProgressLog({ logs }: Props) {
  const getStepIcon = (step: string) => {
    switch (step) {
      case "start":
        return "🚀";
      case "search":
        return "🔍";
      case "validation":
        return "✅";
      case "complete":
        return "🎉";
      case "error":
        return "❌";
      default:
        return "📝";
    }
  };

  return (
    <div className="progress-log">
      {logs.map((log, i) => (
        <div key={i} className={`log-entry log-${log.step}`}>
          <span className="log-icon">{getStepIcon(log.step)}</span>
          <div className="log-content">
            <strong>{log.message}</strong>
            {log.iteration && (
              <span className="iteration"> (Iteration {log.iteration})</span>
            )}
            {log.query && (
              <div className="query">
                <code>{log.query}</code>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
