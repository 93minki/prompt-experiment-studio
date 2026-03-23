import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { useState } from "react";
import type { SystemPrompt } from "../model/types";

interface SystemPromptItemProps {
  systemPrompt: SystemPrompt;
  onActivate?: (version: number) => void;
  onDelete?: (version: number) => void;
  isActivating?: boolean;
  isDeleting?: boolean;
}

export const SystemPromptItem = ({
  systemPrompt,
  onActivate,
  onDelete,
  isActivating = false,
  isDeleting = false,
}: SystemPromptItemProps) => {
  const [detailOpen, setDetailOpen] = useState(false);

  const handleDelete = () => {
    if (systemPrompt.is_current) return;
    const ok = window.confirm(
      `v${systemPrompt.version} 시스템 프롬프트를 삭제하시겠습니까?`,
    );
    if (!ok) return;
    void onDelete?.(systemPrompt.version);
  };
  return (
    <div
      className={`rounded-md border p-3 ${
        systemPrompt.is_current ? "border-blue-500 bg-blue-50" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            v{systemPrompt.version}
          </span>
          {systemPrompt.is_current && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              현재 사용중
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!systemPrompt.is_current && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isActivating || isDeleting}
              onClick={() => void onActivate?.(systemPrompt.version)}
            >
              {isActivating ? "적용 중..." : "사용"}
            </Button>
          )}

          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                보기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>System Prompt v{systemPrompt.version}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[50vh] overflow-auto rounded border p-3 text-sm whitespace-pre-wrap">
                {systemPrompt.content}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="destructive"
            disabled={systemPrompt.is_current || isDeleting || isActivating}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </div>

      <p
        className="mt-2 text-sm text-muted-foreground"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {systemPrompt.content}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        수정: {new Date(systemPrompt.updated_at).toLocaleString("ko-KR")}
      </p>
    </div>
  );
};
