import { useState } from "react";
import { Card, Eyebrow } from "./ui.tsx";

export function ShareCardModal({ markdown, onClose }: { markdown: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(34, 48, 60, 0.45)" }}
      onClick={onClose}
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <Eyebrow>Share card — aggregate posture only, safe to post</Eyebrow>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  void navigator.clipboard.writeText(markdown).then(() => setCopied(true));
                }}
              >
                {copied ? "COPIED" : "COPY MARKDOWN"}
              </button>
              <button className="btn" onClick={onClose}>
                CLOSE
              </button>
            </div>
          </div>
          <pre className="font-mono overflow-x-auto rounded-sm border border-(--color-line) bg-(--color-card-strong) p-3 text-[0.72rem] leading-5 whitespace-pre-wrap">
            {markdown}
          </pre>
          <p className="mt-2 text-[0.7rem] text-(--color-muted)">
            Names, paths and owners are deliberately excluded — a public trust summary should not double as an
            inventory of your stack.
          </p>
        </Card>
      </div>
    </div>
  );
}
