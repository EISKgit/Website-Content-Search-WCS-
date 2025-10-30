import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Code, FileText } from "lucide-react";

interface HtmlToggleViewProps {
  html: string;
  text: string;
}

export default function HtmlToggleView({ html, text }: HtmlToggleViewProps) {
  const [showHtml, setShowHtml] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-3 rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/30">
        <Button
          onClick={() => setShowHtml(!showHtml)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {showHtml ? (
            <>
              <FileText className="h-4 w-4" />
              View Text
            </>
          ) : (
            <>
              <Code className="h-4 w-4" />
              View HTML
            </>
          )}
        </Button>
      </div>

      <div className="p-4">
        {showHtml ? (
          <SyntaxHighlighter
            language="html"
            style={isDark ? vscDarkPlus : oneLight}
            customStyle={{
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            {html}
          </SyntaxHighlighter>
        ) : (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
