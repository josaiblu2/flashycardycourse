"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Info, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateDeck } from "@/app/actions/decks";
import { generateCardsWithAI } from "@/app/actions/generate-cards";
import type { AiGenerationErrorCode } from "@/lib/ai/generation-errors";
import { ProWaitlistForm } from "@/components/pro-waitlist-form";
import { WaitlistJoinedMessage } from "@/components/waitlist-joined-message";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";
import type { WaitlistLimitType } from "@/lib/waitlist/schemas";
import {
  CARD_LANGUAGE_OPTIONS,
  DEFAULT_GENERATION_OPTIONS,
  FLASHCARD_FORMAT_OPTIONS,
  FLASHCARD_LEVEL_OPTIONS,
  type CardLanguage,
  type FlashcardFormat,
  type FlashcardLevel,
  type GenerateCardsOptions,
  getExistingCardsGenerationNotice,
} from "@/lib/ai/generation-context";
import { getGenerateCardsWithAIDisabledState } from "@/lib/generate-cards-button-state";

const WAITLIST_JOINED_STORAGE_KEY = "flashycardy_waitlist_joined";

interface GenerateCardsWithAIButtonProps {
  deckId: number;
  deckName: string;
  deckDescription?: string | null;
  existingCardCount: number;
  canUseAI: boolean;
  isOnWaitlist?: boolean;
}

const LIMIT_ERROR_CODES = new Set<AiGenerationErrorCode>([
  "USER_DAILY_LIMIT_REACHED",
  "USER_MONTHLY_LIMIT_REACHED",
  "GLOBAL_MONTHLY_LIMIT_REACHED",
]);

function getWaitlistLimitType(
  errorCode: AiGenerationErrorCode
): WaitlistLimitType | null {
  switch (errorCode) {
    case "USER_DAILY_LIMIT_REACHED":
      return "user_daily";
    case "USER_MONTHLY_LIMIT_REACHED":
      return "user_monthly";
    case "GLOBAL_MONTHLY_LIMIT_REACHED":
      return "global_monthly";
    default:
      return null;
  }
}

function isLimitErrorCode(
  errorCode: AiGenerationErrorCode | null
): errorCode is AiGenerationErrorCode {
  return errorCode !== null && LIMIT_ERROR_CODES.has(errorCode);
}

function getAiGenerationErrorClassName(
  message: string,
  code?: AiGenerationErrorCode | null
) {
  if (code === "GLOBAL_MONTHLY_LIMIT_REACHED" || message.includes("\n")) {
    return "whitespace-pre-line";
  }
  return "";
}

function handleGenerateResult(
  result: Awaited<ReturnType<typeof generateCardsWithAI>>,
  onSuccess: () => void,
  setError: (message: string | null) => void,
  setErrorCode: (code: AiGenerationErrorCode | null) => void
) {
  if (result.success) {
    setError(null);
    setErrorCode(null);
    onSuccess();
    return;
  }

  setErrorCode(result.code);
  setError(result.message);
}

interface DisabledButtonTooltipProps {
  tooltipMessage: string;
  onWrapperClick?: () => void;
  children: React.ReactNode;
}

function DisabledButtonTooltip({
  tooltipMessage,
  onWrapperClick,
  children,
}: DisabledButtonTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={
              onWrapperClick
                ? "inline-flex cursor-pointer"
                : "inline-flex cursor-not-allowed"
            }
            onClick={onWrapperClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltipMessage}</TooltipContent>
    </Tooltip>
  );
}

function GenerateCardsWithAIProButton({
  deckId,
  deckName,
  deckDescription,
  existingCardCount,
  isOnWaitlist = false,
}: Omit<GenerateCardsWithAIButtonProps, "canUseAI">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<AiGenerationErrorCode | null>(null);
  const [waitlistJoined, setWaitlistJoined] = useState(isOnWaitlist);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState(deckName);
  const [description, setDescription] = useState(deckDescription ?? "");
  const [language, setLanguage] = useState<CardLanguage>(
    DEFAULT_GENERATION_OPTIONS.language
  );
  const [customLanguage, setCustomLanguage] = useState("");
  const [level, setLevel] = useState<FlashcardLevel>(
    DEFAULT_GENERATION_OPTIONS.level
  );
  const [format, setFormat] = useState<FlashcardFormat>(
    DEFAULT_GENERATION_OPTIONS.format
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      if (localStorage.getItem(WAITLIST_JOINED_STORAGE_KEY) === "1") {
        setWaitlistJoined(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  function handleWaitlistJoined() {
    setWaitlistJoined(true);
    try {
      localStorage.setItem(WAITLIST_JOINED_STORAGE_KEY, "1");
    } catch {
      // localStorage unavailable
    }
  }

  const { disabled, reason, tooltipMessage } = getGenerateCardsWithAIDisabledState({
    isPending,
    deckName,
    deckDescription,
  });

  function resetFormFields() {
    setName(deckName);
    setDescription(deckDescription ?? "");
    setLanguage(DEFAULT_GENERATION_OPTIONS.language);
    setCustomLanguage("");
    setLevel(DEFAULT_GENERATION_OPTIONS.level);
    setFormat(DEFAULT_GENERATION_OPTIONS.format);
  }

  function resetDialogFields() {
    resetFormFields();
    setError(null);
    setErrorCode(null);
  }

  function openGenerateDialog() {
    resetDialogFields();
    setDialogOpen(true);
  }

  function handleDialogOpenChange(next: boolean) {
    if (next) {
      resetDialogFields();
    } else {
      resetFormFields();
    }
    setDialogOpen(next);
  }

  function buildOptions(): GenerateCardsOptions {
    return {
      language,
      level,
      format,
      ...(language === "other" && customLanguage.trim()
        ? { customLanguage: customLanguage.trim() }
        : {}),
    };
  }

  function runGeneration(options: GenerateCardsOptions) {
    setError(null);
    setErrorCode(null);

    startTransition(async () => {
      try {
        const result = await generateCardsWithAI({ deckId, options });
        handleGenerateResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        }, setError, setErrorCode);
      } catch {
        setErrorCode(null);
        setError("Failed to generate cards. Please try again.");
      }
    });
  }

  function handleGenerateClick() {
    if (reason === "generating") return;
    openGenerateDialog();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Deck title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Deck description is required for AI generation.");
      return;
    }
    if (language === "other" && !customLanguage.trim()) {
      setError("Please specify the language for your flashcards.");
      return;
    }

    const options = buildOptions();
    const deckChanged =
      name.trim() !== deckName.trim() ||
      description.trim() !== (deckDescription?.trim() ?? "");

    if (!deckChanged) {
      runGeneration(options);
      return;
    }

    startTransition(async () => {
      try {
        await updateDeck({
          deckId,
          name: name.trim(),
          description: description.trim(),
        });
        const result = await generateCardsWithAI({ deckId, options });
        handleGenerateResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        }, setError, setErrorCode);
      } catch {
        setErrorCode(null);
        setError(
          "Failed to save deck details or generate cards. Please try again."
        );
      }
    });
  }

  const errorClassName = getAiGenerationErrorClassName(error ?? "", errorCode);
  const existingCardsNotice =
    getExistingCardsGenerationNotice(existingCardCount);
  const waitlistLimitType =
    errorCode !== null ? getWaitlistLimitType(errorCode) : null;
  const showWaitlist = isLimitErrorCode(errorCode) && waitlistLimitType !== null;

  function renderWaitlistBlock() {
    if (!showWaitlist || !waitlistLimitType) return null;
    if (waitlistJoined) {
      return <WaitlistJoinedMessage />;
    }
    return (
      <ProWaitlistForm
        limitType={waitlistLimitType}
        onJoined={handleWaitlistJoined}
      />
    );
  }

  const generateButton = (
    <Button
      variant="outline"
      onClick={handleGenerateClick}
      disabled={disabled}
      data-icon="inline-start"
    >
      <Sparkles />
      {isPending ? "Generating…" : "Generate cards with AI"}
    </Button>
  );

  const wrappedGenerateButton =
    disabled && tooltipMessage ? (
      <DisabledButtonTooltip
        tooltipMessage={tooltipMessage}
        onWrapperClick={
          reason === "missing-both" ||
          reason === "missing-title" ||
          reason === "missing-description"
            ? openGenerateDialog
            : undefined
        }
      >
        {generateButton}
      </DisabledButtonTooltip>
    ) : (
      generateButton
    );

  return (
    <>
      <div className="flex flex-col items-end gap-3 max-w-md">
        {wrappedGenerateButton}
        {error && !dialogOpen && (
          <div className="w-full space-y-3 text-left">
            <p
              className={`text-sm text-destructive text-right ${errorClassName ?? ""}`}
            >
              {error}
            </p>
            {renderWaitlistBlock()}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[min(90vh,720px)] overflow-y-auto">
          <DialogHeader>
            {showWaitlist ? (
              <>
                <DialogTitle>Join the Pro waitlist</DialogTitle>
                <DialogDescription>
                  AI generation is unavailable right now. Share your interest
                  and pricing expectations so we can prioritize expanded
                  access.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Generate flashcards with AI</DialogTitle>
                <DialogDescription>
                  Set your topic, language, and card style. Better details produce
                  more accurate flashcards.
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          {showWaitlist && waitlistLimitType ? (
            <div className="space-y-4 py-2">
              {error && (
                <p
                  className={`text-sm text-destructive ${errorClassName ?? ""}`}
                >
                  {error}
                </p>
              )}
              {renderWaitlistBlock()}
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {existingCardsNotice && (
              <Alert>
                <Info />
                <AlertTitle>Existing cards will be considered</AlertTitle>
                <AlertDescription>{existingCardsNotice}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="ai-deck-name">Title</Label>
              <Input
                id="ai-deck-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dental terminology, Roman history, Japanese travel phrases"
                disabled={isPending}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-deck-description">Description</Label>
              <Textarea
                id="ai-deck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what to learn, scope, and any notes (e.g. beginner level, focus on anatomy)"
                disabled={isPending}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ai-card-language">Card language</Label>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as CardLanguage)}
                  disabled={isPending}
                >
                  <SelectTrigger id="ai-card-language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ai-card-level">Level</Label>
                <Select
                  value={level}
                  onValueChange={(value) => setLevel(value as FlashcardLevel)}
                  disabled={isPending}
                >
                  <SelectTrigger id="ai-card-level" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FLASHCARD_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {language === "other" && (
              <div className="space-y-1.5">
                <Label htmlFor="ai-custom-language">Custom language</Label>
                <Input
                  id="ai-custom-language"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  placeholder="e.g. Catalan, Arabic, Dutch"
                  disabled={isPending}
                  maxLength={50}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="ai-card-format">Card format</Label>
              <Select
                value={format}
                onValueChange={(value) => setFormat(value as FlashcardFormat)}
                disabled={isPending}
              >
                <SelectTrigger id="ai-card-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLASHCARD_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {
                  FLASHCARD_FORMAT_OPTIONS.find((option) => option.value === format)
                    ?.description
                }
              </p>
            </div>

            {error && (
              <p
                className={`text-sm text-destructive ${errorClassName ?? ""}`}
              >
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDialogOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              {!showWaitlist &&
                (isPending ? (
                  <DisabledButtonTooltip tooltipMessage="Generating flashcards. Please wait…">
                    <Button type="submit" disabled data-icon="inline-start">
                      <Sparkles />
                      Generating…
                    </Button>
                  </DisabledButtonTooltip>
                ) : (
                  <Button type="submit" data-icon="inline-start">
                    <Sparkles />
                    Generate cards
                  </Button>
                ))}
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function GenerateCardsWithAIFreeButton() {
  return <UpgradeToProButton />;
}

export function GenerateCardsWithAIButton({
  deckId,
  deckName,
  deckDescription,
  existingCardCount,
  canUseAI,
  isOnWaitlist = false,
}: GenerateCardsWithAIButtonProps) {
  if (!canUseAI) {
    return <GenerateCardsWithAIFreeButton />;
  }

  return (
    <GenerateCardsWithAIProButton
      deckId={deckId}
      deckName={deckName}
      deckDescription={deckDescription}
      existingCardCount={existingCardCount}
      isOnWaitlist={isOnWaitlist}
    />
  );
}
