"use client";

import { useEffect, useRef, useState } from "react";

const MAX_FRAME_WIDTH = 300;
const MAX_FRAME_HEIGHT = 420;
const OUTPUT_LONG_SIDE = 1400;
const MAX_ZOOM = 3;

type Props = {
  file: File;
  /** width / height of the crop frame — e.g. 9/16 for a phone-camera product photo, 1 for a square thumbnail. */
  aspectRatio?: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

/**
 * Lets the admin pan/zoom a photo inside a frame before upload, so they see
 * — and control — exactly how it'll be cropped in the catalog, instead of
 * whatever CSS object-cover happens to pick.
 */
export function ImageCropper({ file, aspectRatio = 9 / 16, onCancel, onConfirm }: Props) {
  // Fit the frame inside a max box, whichever side binds first, so tall
  // (portrait, phone-camera) crops don't blow past the modal's height.
  const fitsByWidth = aspectRatio >= MAX_FRAME_WIDTH / MAX_FRAME_HEIGHT;
  const frameW = fitsByWidth ? MAX_FRAME_WIDTH : Math.round(MAX_FRAME_HEIGHT * aspectRatio);
  const frameH = fitsByWidth ? Math.round(MAX_FRAME_WIDTH / aspectRatio) : MAX_FRAME_HEIGHT;
  const outputW = aspectRatio >= 1 ? OUTPUT_LONG_SIDE : Math.round(OUTPUT_LONG_SIDE * aspectRatio);
  const outputH = aspectRatio >= 1 ? Math.round(OUTPUT_LONG_SIDE / aspectRatio) : OUTPUT_LONG_SIDE;

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  const baseScale = naturalSize ? Math.max(frameW / naturalSize.w, frameH / naturalSize.h) : 1;
  const totalScale = baseScale * zoom;
  const displayW = naturalSize ? naturalSize.w * totalScale : frameW;
  const displayH = naturalSize ? naturalSize.h * totalScale : frameH;

  function clamp(pos: { x: number; y: number }, w: number, h: number) {
    const minX = frameW - w;
    const minY = frameH - h;
    return {
      x: Math.min(0, Math.max(minX, pos.x)),
      y: Math.min(0, Math.max(minY, pos.y)),
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clamp({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy }, displayW, displayH));
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleZoomChange(next: number) {
    if (!naturalSize) return;
    const nextTotalScale = baseScale * next;
    const nextW = naturalSize.w * nextTotalScale;
    const nextH = naturalSize.h * nextTotalScale;
    setZoom(next);
    setOffset((prev) => clamp(prev, nextW, nextH));
  }

  async function handleConfirm() {
    const img = imgRef.current;
    if (!img || !naturalSize) return;
    setIsSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");

      const sx = -offset.x / totalScale;
      const sy = -offset.y / totalScale;
      const sWidth = frameW / totalScale;
      const sHeight = frameH / totalScale;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputW, outputH);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("failed to export");
      onConfirm(blob);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
        <p className="mb-1 text-sm font-semibold text-neutral-900">Ajustar foto</p>
        <p className="mb-3 text-xs text-neutral-500">
          Arraste pra posicionar e use o controle pra dar zoom. É assim que vai aparecer pros clientes.
        </p>

        <div
          className="relative mx-auto touch-none overflow-hidden rounded-xl bg-neutral-100"
          style={{ width: frameW, height: frameH }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              onLoad={handleImgLoad}
              draggable={false}
              className="absolute left-0 top-0 max-w-none cursor-grab select-none active:cursor-grabbing"
              style={{ width: displayW, height: displayH, transform: `translate(${offset.x}px, ${offset.y}px)` }}
            />
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-neutral-400">−</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-neutral-400">+</span>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!naturalSize || isSaving}
            className="flex-1 rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Usar foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
