"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  responses,
  get404,
  endpoints,
  site,
  type ApiResponse,
} from "@/data/responses";

/* ─── JSON Syntax Highlighter ─── */
let globalKeyCounter = 0;

function highlightJson(obj: unknown, indent = 0, isRoot = true): React.ReactNode[] {
  if (isRoot) globalKeyCounter = 0;

  const nodes: React.ReactNode[] = [];
  const pad = "  ".repeat(indent);
  const padInner = "  ".repeat(indent + 1);

  const getKey = () => `k-${globalKeyCounter++}`;

  if (Array.isArray(obj)) {
    nodes.push(<span key={getKey()}>{"[\n"}</span>);
    obj.forEach((item, i) => {
      nodes.push(<span key={getKey()}>{padInner}</span>);
      nodes.push(...highlightJson(item, indent + 1, false));
      if (i < obj.length - 1) nodes.push(<span key={getKey()}>{","}</span>);
      nodes.push(<span key={getKey()}>{"\n"}</span>);
    });
    nodes.push(<span key={getKey()}>{pad}]</span>);
  } else if (obj !== null && typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    nodes.push(<span key={getKey()}>{"{\n"}</span>);
    entries.forEach(([key, value], i) => {
      nodes.push(<span key={getKey()}>{padInner}</span>);
      nodes.push(
        <span key={getKey()} className="text-emerald-400">
          &quot;{key}&quot;
        </span>
      );
      nodes.push(
        <span key={getKey()} className="text-gray-400">
          {": "}
        </span>
      );
      nodes.push(...highlightJson(value, indent + 1, false));
      if (i < entries.length - 1)
        nodes.push(<span key={getKey()}>{","}</span>);
      nodes.push(<span key={getKey()}>{"\n"}</span>);
    });
    nodes.push(
      <span key={getKey()}>
        {pad}
        {"}"}
      </span>
    );
  } else if (typeof obj === "string") {
    // Check if it's a URL — render as a clickable link
    if (obj.startsWith("http://") || obj.startsWith("https://")) {
      nodes.push(
        <a
          key={getKey()}
          href={obj}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:underline hover:text-amber-200 transition-colors"
        >
          &quot;{obj}&quot;
        </a>
      );
    } else if (obj.includes("@") && obj.includes(".")) {
      // email
      nodes.push(
        <a
          key={getKey()}
          href={`mailto:${obj}`}
          className="text-amber-300 hover:underline hover:text-amber-200 transition-colors"
        >
          &quot;{obj}&quot;
        </a>
      );
    } else if (obj.startsWith("github.com/")) {
      nodes.push(
        <a
          key={getKey()}
          href={`https://${obj}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:underline hover:text-amber-200 transition-colors"
        >
          &quot;{obj}&quot;
        </a>
      );
    } else {
      nodes.push(
        <span key={getKey()} className="text-amber-300">
          &quot;{obj}&quot;
        </span>
      );
    }
  } else if (typeof obj === "number") {
    nodes.push(
      <span key={getKey()} className="text-purple-400">
        {String(obj)}
      </span>
    );
  } else if (typeof obj === "boolean") {
    nodes.push(
      <span key={getKey()} className="text-cyan-400">
        {String(obj)}
      </span>
    );
  } else if (obj === null) {
    nodes.push(
      <span key={getKey()} className="text-gray-500">
        null
      </span>
    );
  }

  return nodes;
}

/* ─── Status Badge ─── */
function StatusBadge({ code }: { code: number }) {
  const color =
    code >= 200 && code < 300
      ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
      : code >= 400
      ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
      : "text-blue-400 border-blue-400/30 bg-blue-400/10";

  return (
    <span className={`px-2 py-0.5 text-xs font-mono border rounded ${color}`}>
      {code}
    </span>
  );
}

/* ─── Loading Dots ─── */
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-8 justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  /* ─── Execute an "API call" ─── */
  const executeRequest = useCallback((path: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    setActiveRoute(normalized);
    setIsLoading(true);

    // If it's /resume, trigger download
    if (normalized === "/resume") {
      const link = document.createElement("a");
      link.href = `/${site.resumeFile}`;
      link.download = site.resumeFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => {
      const res = responses[normalized] || get404(normalized);
      setResponse(res);
      setIsLoading(false);

      // Scroll to response on mobile
      setTimeout(() => {
        responseRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 600);
  }, []);

  /* ─── Auto-demo on first load ─── */
  useEffect(() => {
    if (hasAutoPlayed) return;

    const targetText = endpoints[0].path;
    let charIndex = 0;
    setIsTyping(true);

    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        charIndex++;
        setInputValue(targetText.slice(0, charIndex));
        if (charIndex >= targetText.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
          setTimeout(() => {
            executeRequest(targetText);
            setHasAutoPlayed(true);
          }, 400);
        }
      }, 100);

      return () => clearInterval(typeInterval);
    }, 800);

    return () => clearTimeout(startDelay);
  }, [hasAutoPlayed, executeRequest]);

  /* ─── Handle form submit ─── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      executeRequest(inputValue.trim());
    }
  };

  /* ─── Handle chip click ─── */
  const handleChipClick = (path: string) => {
    if (isLoading) return;
    setInputValue(path);
    executeRequest(path);
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col">
      {/* ─── Resume Download Shortcut ─── */}
      <a
        href={`/${site.resumeFile}`}
        download={site.resumeFile}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-[#161b22] border border-gray-700/50 rounded-lg hover:border-emerald-400/50 hover:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all duration-300 group"
        title="Download Resume"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-xs font-mono text-gray-400 group-hover:text-emerald-400 transition-colors hidden sm:inline">
          resume.pdf
        </span>
      </a>

      {/* ─── Hero / Search Area ─── */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          response ? "pt-12 sm:pt-16" : "pt-32 sm:pt-48"
        }`}
      >
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-gray-100 mb-2">
            <span className="text-emerald-400">{">"}</span> {site.domain}
            <span className="text-emerald-400">/api</span>
          </h1>
          <p className="text-sm text-gray-500 font-mono">{site.tagline}</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl px-4 sm:px-6">
          <div className="flex items-center bg-[#161b22] border border-gray-700/50 rounded-xl px-4 py-3 focus-within:border-emerald-400/50 focus-within:shadow-[0_0_20px_rgba(52,211,153,0.1)] transition-all duration-300">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded mr-3 shrink-0">
              GET
            </span>
            <span className="text-gray-500 font-mono text-sm mr-1 hidden sm:inline shrink-0">
              https://{site.domain}/api
            </span>
            <span className="text-gray-500 font-mono text-sm mr-1 sm:hidden shrink-0">
              /api
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => !isTyping && setInputValue(e.target.value)}
              placeholder={endpoints[0].path}
              className="flex-1 bg-transparent font-mono text-sm text-gray-100 outline-none placeholder-gray-600 min-w-0"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="ml-2 text-gray-500 hover:text-emerald-400 disabled:opacity-30 transition-colors shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Endpoint Chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 px-4">
          {endpoints.map(({ method, path }) => (
            <button
              key={path}
              onClick={() => handleChipClick(path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs border transition-all duration-200 ${
                activeRoute === path
                  ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]"
                  : "border-gray-700/50 bg-[#161b22] text-gray-400 hover:border-gray-600 hover:text-gray-300"
              }`}
            >
              <span className="text-[10px] font-bold text-emerald-500">
                {method}
              </span>
              {path}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Response Panel ─── */}
      <div
        ref={responseRef}
        className={`w-full max-w-2xl mx-auto px-4 sm:px-6 transition-all duration-500 ${
          response || isLoading
            ? "mt-8 mb-12 opacity-100"
            : "mt-0 opacity-0 pointer-events-none"
        }`}
      >
        {(isLoading || response) && (
          <div className="bg-[#161b22] border border-gray-700/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            {/* Response Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700/50 bg-[#1c2129]">
              <div className="flex items-center gap-3">
                {/* Traffic lights */}
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-xs text-gray-500">
                  Response
                </span>
              </div>
              {response && !isLoading && (
                <div className="flex items-center gap-2">
                  <StatusBadge code={response.status} />
                  <span className="font-mono text-xs text-gray-500">
                    {response.statusText}
                  </span>
                </div>
              )}
            </div>

            {isLoading ? (
              <LoadingDots />
            ) : (
              response && (
                <div className="animate-fadeIn">
                  {/* Response Headers */}
                  <div className="px-4 py-2 border-b border-gray-700/30 bg-[#161b22]">
                    <button
                      className="text-[10px] font-mono text-gray-600 hover:text-gray-400 transition-colors cursor-pointer select-none"
                      onClick={(e) => {
                        const el = e.currentTarget.nextElementSibling;
                        if (el) el.classList.toggle("hidden");
                      }}
                    >
                      ▸ Headers
                    </button>
                    <div className="hidden mt-1">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div
                          key={key}
                          className="font-mono text-[11px] leading-5"
                        >
                          <span className="text-blue-400">{key}</span>
                          <span className="text-gray-600">: </span>
                          <span className="text-gray-400">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* JSON Body */}
                  <div className="p-4 overflow-x-auto">
                    <pre className="font-mono text-[13px] leading-6 text-gray-300 whitespace-pre-wrap break-words">
                      {highlightJson(response.body)}
                    </pre>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="mt-auto py-6 text-center">
        <p className="font-mono text-xs text-gray-600">
          <span className="text-gray-700">{"// "}</span>
          &copy; {new Date().getFullYear()} {site.name}
          <span className="text-gray-700"> &bull; </span>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-emerald-400 transition-colors"
          >
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
