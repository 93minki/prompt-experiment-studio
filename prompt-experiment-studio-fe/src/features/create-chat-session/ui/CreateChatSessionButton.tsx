import { chatSessionApi, type ChatSession } from "@/app/entities/chat-session";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { useState } from "react";

interface CreateChatSessionButtonProps {
  onCreated?: (session: ChatSession) => void;
}

export const CreateChatSessionButton = ({
  onCreated,
}: CreateChatSessionButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [systemMessage, setSystemMessage] = useState("");

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const created = await chatSessionApi.create({
        title,
        systemMessage: systemMessage.trim(),
      });
      onCreated?.(created);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          {isCreating ? "생성 중..." : "New Session"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새로운 세션을 생성합니다.</DialogTitle>
            <DialogDescription>
              세션 이름과 시스템 프롬프트를 작성해주세요.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="세션 이름"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="시스템 프롬프트"
            className="min-h-96 max-h-128 resize-none"
            value={systemMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setSystemMessage(e.target.value)
            }
          />
          <DialogFooter>
            <Button onClick={() => void handleCreate()} disabled={isCreating}>
              생성
            </Button>
            <DialogClose>취소</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
