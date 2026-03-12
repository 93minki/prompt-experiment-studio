import { type Provider } from "@/entities/api-key";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { TabsContent } from "@/shared/ui/tabs";
import { toast } from "sonner";
import { useApiConnection } from "../model/useApiConnection";

export const ApiConnection = () => {
  const {
    providers,
    apiKeys,
    providerStatus,
    isLoadingKeys,
    isSaving,
    isDeleting,
    messageByProvider,
    setKey,
    create,
    update,
    remove,
  } = useApiConnection();

  const onUpdate = async (provider: Provider) => {
    const result = await update(provider);
    if (!result.message) return;
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const onCreate = async (provider: Provider) => {
    const result = await create(provider);
    if (!result.message) return;
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const onDelete = async (provider: Provider) => {
    const result = await remove(provider);
    if (!result.message) return;
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <TabsContent value="api" className="flex flex-col gap-4 pt-4">
      {isLoadingKeys && (
        <p className="text-xs text-muted-foreground">
          저장된 API 키 정보를 불러오는 중...
        </p>
      )}

      {providers.map((provider) => {
        const key = provider.key;
        const status = providerStatus[key];

        return (
          <Label key={key} htmlFor={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium">{provider.label}</span>
              <span className="text-xs text-muted-foreground">
                {status.exists
                  ? `등록됨 (${status.masked ?? "masked 없음"})`
                  : "등록된 키 없음"}
              </span>
            </div>

            <div className="w-full flex gap-2">
              <Input
                id={key}
                type="text"
                placeholder={provider.placeholder}
                value={apiKeys[key]}
                onChange={(e) => setKey(key, e.target.value)}
              />
              {status.exists ? (
                <Button
                  type="button"
                  disabled={isSaving[key]}
                  onClick={() => void onUpdate(key)}
                >
                  {isSaving[key] ? "수정 중..." : "수정"}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSaving[key]}
                  onClick={() => void onCreate(key)}
                >
                  {isSaving[key] ? "저장 중..." : "저장"}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={!status.exists || isSaving[key] || isDeleting[key]}
                onClick={() => void onDelete(key)}
              >
                {isDeleting[key] ? "삭제 중..." : "삭제"}
              </Button>
            </div>

            {messageByProvider[key] && (
              <p className="text-xs text-muted-foreground">
                {messageByProvider[key]}
              </p>
            )}
          </Label>
        );
      })}
    </TabsContent>
  );
};
