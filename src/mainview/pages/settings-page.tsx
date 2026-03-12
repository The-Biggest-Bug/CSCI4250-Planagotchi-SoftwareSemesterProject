import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Layout from "@/mainview/layout";
import {
  Cog6ToothIcon,
  HomeIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  DINO_BACKGROUND_OPTIONS,
  EGG_BACKGROUND_OPTIONS,
  type BackgroundOption,
} from "@/mainview/backgrounds";
import { Button } from "@/mainview/components/ui/button";
import type { ButtonConfig, Navigate } from "@/mainview/types";
import type { AppBackgroundDTO } from "@/shared/rpc";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1024;

async function fileToBackgroundDataUrl(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Choose an image under 8 MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () =>
        reject(new Error("That image could not be loaded."));
      nextImage.src = objectUrl;
    });

    const scale = Math.min(
      1,
      MAX_IMAGE_EDGE /
        Math.max(image.naturalWidth || 1, image.naturalHeight || 1),
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Your browser could not prepare that image.");
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/webp", 0.9);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

type ActivePicker = "egg" | "dino" | null;

interface SettingsPageProps {
  navigate: Navigate;
  eggFillColor: string;
  eggBackground: string;
  eggBackgroundImageUrl: string;
  dinoBackground: AppBackgroundDTO;
  dinoBackgroundImageUrl: string;
  onEggColorChange: (color: string) => void;
  onEggBackgroundChange: (value: string) => Promise<void>;
  onDinoBackgroundChange: (background: AppBackgroundDTO) => Promise<void>;
}

function SettingsRow({
  label,
  control,
  onClick,
}: {
  label: string;
  control: ReactNode;
  onClick?: () => void;
}) {
  const className = "w-full px-1 py-1 text-left";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} transition hover:bg-white/10 electrobun-webkit-app-region-no-drag`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-white">{label}</span>
          {control}
        </div>
      </button>
    );
  }

  return (
    <div className={`${className} electrobun-webkit-app-region-no-drag`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">{label}</span>
        {control}
      </div>
    </div>
  );
}

function BackgroundButton({
  label,
  imageUrl,
  onClick,
}: {
  label: string;
  imageUrl: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-1 flex-col gap-2 text-left transition opacity-90 hover:opacity-100 electrobun-webkit-app-region-no-drag"
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/80">
        {label}
      </span>
      <div
        className="h-14 w-full rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />
    </button>
  );
}

function BackgroundGrid({
  options,
  selectedValue,
  onSelect,
}: {
  options: readonly BackgroundOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selectedValue === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`rounded-xl border p-1 text-left transition electrobun-webkit-app-region-no-drag ${
              isSelected
                ? "border-sky-300 bg-sky-200/20 shadow-[0_0_0_1px_rgba(125,211,252,0.6)]"
                : "border-white/15 bg-black/30 hover:bg-white/10"
            }`}
          >
            <div
              className="h-14 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url("${option.imageUrl}")` }}
            />
            <div className="px-1 pt-1 text-[9px] uppercase tracking-[0.18em] text-white/75">
              {option.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PickerModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-card/95 backdrop-blur-sm p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border/60 bg-background/30 p-1 text-muted-foreground transition hover:bg-accent/60 electrobun-webkit-app-region-no-drag"
          aria-label="close"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export default function SettingsPage({
  navigate,
  eggFillColor,
  eggBackground,
  eggBackgroundImageUrl,
  dinoBackground,
  dinoBackgroundImageUrl,
  onEggColorChange,
  onEggBackgroundChange,
  onDinoBackgroundChange,
}: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const buttons: ButtonConfig[] = [
    { icon: HomeIcon, onClick: () => navigate("home"), ariaLabel: "home" },
    {
      icon: ListBulletIcon,
      onClick: () => navigate("tasks"),
      ariaLabel: "tasks",
    },
    { icon: Cog6ToothIcon, onClick: () => {}, ariaLabel: "settings" },
  ];

  const handleEggBackgroundSelect = async (value: string) => {
    await onEggBackgroundChange(value);
    setActivePicker(null);
  };

  const handleDinoBackgroundSelect = async (value: string) => {
    setUploadError(null);
    await onDinoBackgroundChange({ kind: "preset", value });
    setActivePicker(null);
  };

  const handleCustomUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const value = await fileToBackgroundDataUrl(file);
      await onDinoBackgroundChange({ kind: "custom", value });
      setActivePicker(null);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "That image could not be used.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout buttons={buttons} eggFillColor={eggFillColor}>
      <div className="relative h-full w-full overflow-hidden px-2 py-3">
        <div className="flex flex-col gap-3">
          <h2 className="px-1 text-base font-semibold text-white">Settings</h2>

          <SettingsRow
            label="Egg color"
            control={
              <label className="relative h-8 w-8 shrink-0 cursor-pointer electrobun-webkit-app-region-no-drag">
                <span
                  className="absolute inset-0 rounded-full border border-white/30"
                  style={{ backgroundColor: eggFillColor }}
                />
                <input
                  type="color"
                  value={eggFillColor}
                  onChange={(event) => onEggColorChange(event.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="egg color"
                />
              </label>
            }
          />

          <div className="w-full px-1 electrobun-webkit-app-region-no-drag">
            <div className="mb-2 text-sm font-medium text-white">
              Backgrounds
            </div>
            <div className="flex gap-2">
              <BackgroundButton
                label="Egg bg"
                imageUrl={eggBackgroundImageUrl}
                onClick={() => setActivePicker("egg")}
              />
              <BackgroundButton
                label="Dino bg"
                imageUrl={dinoBackgroundImageUrl}
                onClick={() => setActivePicker("dino")}
              />
            </div>
          </div>
        </div>

        {activePicker === "egg" ? (
          <PickerModal
            title="Egg Background"
            onClose={() => setActivePicker(null)}
          >
            <BackgroundGrid
              options={EGG_BACKGROUND_OPTIONS}
              selectedValue={eggBackground}
              onSelect={(value) => void handleEggBackgroundSelect(value)}
            />
          </PickerModal>
        ) : null}

        {activePicker === "dino" ? (
          <PickerModal
            title="Dino Background"
            onClose={() => setActivePicker(null)}
          >
            <div className="flex flex-col gap-2.5">
              <BackgroundGrid
                options={DINO_BACKGROUND_OPTIONS}
                selectedValue={
                  dinoBackground.kind === "preset" ? dinoBackground.value : ""
                }
                onSelect={(value) => void handleDinoBackgroundSelect(value)}
              />

              <div
                className={`rounded-xl border p-2 ${
                  dinoBackground.kind === "custom"
                    ? "border-sky-300 bg-sky-200/20"
                    : "border-white/15 bg-black/30"
                }`}
              >
                <div
                  className="h-16 rounded-lg bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${dinoBackgroundImageUrl}")`,
                  }}
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-medium text-white">
                    Custom image
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 border-white/20 bg-black/25 px-2 text-[10px] text-white hover:bg-white/10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomUpload}
                />
                {uploadError ? (
                  <div className="mt-2 text-[10px] text-rose-200/85">
                    {uploadError}
                  </div>
                ) : null}
              </div>
            </div>
          </PickerModal>
        ) : null}
      </div>
    </Layout>
  );
}
