"use client";

import ReactMarkdown from "react-markdown";
import { selectedStateTheme as T } from "./selectedStateTheme";

export function SelectedStateMarkdown({ text }: { text: string }) {
  return (
    <div className="text-xs leading-relaxed" style={{ color: T.text }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 style={{ color: T.amber, fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px" }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ color: T.amberDim, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "4px", marginTop: "10px" }}>
              {children}
            </h2>
          ),
          strong: ({ children }) => <strong style={{ color: T.amberDim }}>{children}</strong>,
          p: ({ children }) => <p style={{ marginBottom: "6px", color: T.text }}>{children}</p>,
          li: ({ children }) => (
            <li style={{ marginBottom: "2px", color: T.text, listStyleType: "disc", marginLeft: "12px" }}>
              {children}
            </li>
          ),
          ul: ({ children }) => <ul style={{ marginBottom: "6px" }}>{children}</ul>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
