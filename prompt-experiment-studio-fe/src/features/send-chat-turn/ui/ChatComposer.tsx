import type {
  ChatImageAttachment,
  CreateChatTurnPayload,
} from "@/entities/message";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ChatComposerProps {
  disabled?: boolean;
  isSending?: boolean;
  onSend: (payload: CreateChatTurnPayload) => Promise<boolean>;
}

// "openai": ["gpt-4o", "gpt-4o-mini", "gpt-5", "gpt-5-nano"],
// "google": ["gemini-2.5-flash", "gemini-2.5-pro"],

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-5", label: "GPT-5" },
  { value: "gpt-5-nano", label: "GPT-5 Nano" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

const MAX_ATTACHMENTS = 5;
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("파일을 읽지 못했습니다."));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("파일을 읽지 못했습니다."));
    };

    reader.readAsDataURL(file);
  });

export const ChatComposer = ({
  disabled = false,
  isSending = false,
  onSend,
}: ChatComposerProps) => {
  const [humanMessage, setHumanMessage] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [attachments, setAttachments] = useState<ChatImageAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateTextareaLayout = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const resetTextareaLayout = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
  };

  const handleSubmit = async () => {
    if (disabled || isSending) return;
    if (!humanMessage.trim() && attachments.length === 0) return;

    const isSent = await onSend({
      userMessage: humanMessage,
      model,
      images: attachments,
    });

    if (!isSent) return;

    setHumanMessage("");
    setAttachments([]);
    resetTextareaLayout();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isSending) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || isSending) return;

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) return;

    await addFilesAsAttachments(files);
  };
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const addFilesAsAttachments = async (files: File[]) => {
    if (files.length === 0) return;

    const nonImageFile = files.find(
      (file) => !ACCEPTED_IMAGE_TYPES.includes(file.type),
    );
    if (nonImageFile) {
      toast.error("이미지 파일만 첨부할 수 있습니다.");
      return;
    }

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`이미지는 최대 ${MAX_ATTACHMENTS}개까지 첨부할 수 있습니다.`);
      return;
    }

    try {
      const nextAttachments = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await readFileAsDataUrl(file);

          return {
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name || "pasted-image.png",
            mimeType: file.type,
            dataUrl,
          } satisfies ChatImageAttachment;
        }),
      );

      setAttachments((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const deduped = nextAttachments.filter(
          (item) => !existingIds.has(item.id),
        );
        return [...prev, ...deduped];
      });
    } catch {
      toast.error("이미지 파일을 읽는 중 오류가 발생했습니다.");
    }
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    await addFilesAsAttachments(files);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);

    const imageFiles = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (imageFiles.length === 0) return;

    e.preventDefault();
    await addFilesAsAttachments(imageFiles);
  };

  return (
    <div className="flex min-w-0 w-full flex-col gap-2">
      <Select
        value={model}
        onValueChange={setModel}
        disabled={disabled || isSending}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div
        className={`rounded-md border p-2 transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          void handleDrop(e);
        }}
      >
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              >
                <span>{attachment.name}</span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  disabled={disabled || isSending}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-2 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFilesSelected(e.target.files);
              e.currentTarget.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenFilePicker}
            disabled={
              disabled || isSending || attachments.length >= MAX_ATTACHMENTS
            }
          >
            <Paperclip className="mr-2 h-4 w-4" />
            이미지 첨부
          </Button>
          <p className="text-xs text-muted-foreground">
            최대 {MAX_ATTACHMENTS}개
          </p>
        </div>

        {isDragOver && (
          <p className="mb-2 text-sm text-primary">
            여기에 이미지를 놓으면 첨부됩니다.
          </p>
        )}

        <div className="relative flex min-w-0 w-full items-end gap-2 border rounded-md p-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-transparent">
          <Textarea
            className="border-none field-sizing-fixed min-h-10 max-h-32 min-w-0 w-[97%] resize-none overflow-x-hidden overflow-y-hidden whitespace-pre-wrap break-all leading-6 focus-visible:outline-none focus-visible:ring-0"
            placeholder="메시지를 입력하세요"
            rows={1}
            value={humanMessage}
            ref={textareaRef}
            disabled={disabled || isSending}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setHumanMessage(e.target.value);
              updateTextareaLayout();
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
            onPaste={(e) => {
              void handlePaste(e);
            }}
          />
          <Button
            className="absolute right-2 bottom-1 w-10 h-10 rounded-full"
            onClick={() => void handleSubmit()}
            disabled={
              disabled ||
              isSending ||
              (!humanMessage.trim() && attachments.length === 0)
            }
          >
            {isSending ? "전송 중..." : "입력"}
          </Button>
        </div>
      </div>
    </div>
  );
};
