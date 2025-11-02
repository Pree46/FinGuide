import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ text }) => {
  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        padding: "16px",
        lineHeight: "1.6",
        fontFamily: "'Inter', sans-serif",
        color: "#1f2937",
        whiteSpace: "pre-wrap",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#1e3a8a", marginBottom: "0.75rem" }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#1e40af", marginBottom: "0.5rem" }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1d4ed8", marginBottom: "0.5rem" }} {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong style={{ fontWeight: "600", color: "#111827" }} {...props} />
          ),
          em: ({ node, ...props }) => (
            <em style={{ color: "#374151", fontStyle: "italic" }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul style={{ paddingLeft: "20px", listStyleType: "disc", marginBottom: "10px" }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ paddingLeft: "20px", listStyleType: "decimal", marginBottom: "10px" }} {...props} />
          ),
          li: ({ node, ...props }) => <li style={{ marginBottom: "6px" }} {...props} />,
          p: ({ node, ...props }) => <p style={{ marginBottom: "10px" }} {...props} />,
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                style={{
                  backgroundColor: "#e5e7eb",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
                {...props}
              />
            ) : (
              <pre
                style={{
                  backgroundColor: "#1f2937",
                  color: "#f9fafb",
                  padding: "10px",
                  borderRadius: "8px",
                  overflowX: "auto",
                }}
              >
                <code {...props} />
              </pre>
            ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
