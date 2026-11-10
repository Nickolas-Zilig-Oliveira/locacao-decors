"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Category, Item, ItemComponent, KitComponentCatalogEntry } from "@/lib/types";
import { formatMoneyTyping, moneyToDisplay, parseMoneyTyping } from "@/lib/masks";
import { prepareImage, uploadPhoto, validateImageFile } from "@/lib/upload";
import { ImageCropper } from "@/components/image-cropper";
import { autosaveItem, saveItem, type ItemInput } from "./actions";
import { suggestItemDetails } from "./ai-suggest";

function blockNonNumericKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15";

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: Date }
  | { kind: "error"; message: string };

export function ItemForm({
  item,
  categories,
  existingComponents,
}: {
  item?: Item;
  categories: Category[];
  existingComponents: KitComponentCatalogEntry[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [itemId, setItemId] = useState<string | null>(item?.id ?? null);
  const [isDraft, setIsDraft] = useState(false);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });

  const [imageUrl, setImageUrl] = useState<string>(item?.images?.[0] ?? "");
  const [photoBusy, setPhotoBusy] = useState<null | "preparing" | "uploading">(null);
  const [name, setName] = useState(item?.name ?? "");
  const [isKit, setIsKit] = useState(item?.is_kit ?? true);
  const [active, setActive] = useState(item?.active ?? true);
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "");
  const [price, setPrice] = useState(item ? moneyToDisplay(item.price) : "");
  const [pieceCount, setPieceCount] = useState(item?.piece_count != null ? String(item.piece_count) : "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [components, setComponents] = useState<ItemComponent[]>(item?.components ?? []);
  const [uploadingComponent, setUploadingComponent] = useState<number | null>(null);
  const [suggestFor, setSuggestFor] = useState<number | null>(null);
  const [pendingCrop, setPendingCrop] = useState<{ file: File; target: "main" | number } | null>(null);

  // ── Autosave plumbing ────────────────────────────────────────────────
  const itemIdRef = useRef<string | null>(item?.id ?? null);
  const isDraftRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const dirtyAgainRef = useRef(false);
  const pendingRef = useRef(false);
  const componentsDirtyRef = useRef(false);
  const lastSavedRef = useRef<string | null>(null);
  const latestRef = useRef({ name, price, pieceCount, description, categoryId, imageUrl, isKit, active, components });

  useEffect(() => {
    latestRef.current = { name, price, pieceCount, description, categoryId, imageUrl, isKit, active, components };
  });

  function buildInput(forceActive?: boolean): ItemInput {
    const v = latestRef.current;
    return {
      id: itemIdRef.current,
      name: v.name,
      price: parseMoneyTyping(v.price),
      pieceCount: v.pieceCount === "" ? null : Number(v.pieceCount),
      description: v.description,
      categoryId: v.categoryId || null,
      imageUrl: v.imageUrl,
      isKit: v.isKit,
      active: forceActive ?? (isDraftRef.current || !itemIdRef.current ? false : v.active),
      components: v.components,
      syncComponents: componentsDirtyRef.current,
    };
  }

  function signature(input: ItemInput) {
    return JSON.stringify({ ...input, syncComponents: false });
  }

  async function runAutosave() {
    pendingRef.current = false;
    if (inFlightRef.current) {
      dirtyAgainRef.current = true;
      return;
    }
    const v = latestRef.current;
    const empty =
      !v.name.trim() && !v.imageUrl && !v.description.trim() && !parseMoneyTyping(v.price) && !v.components.some((c) => c.name.trim());
    if (!itemIdRef.current && empty) return;

    const input = buildInput();
    const sig = signature(input);
    if (sig === lastSavedRef.current) return;

    setSave({ kind: "saving" });
    const work = (async () => {
      try {
        const result = await autosaveItem(input);
        if (!result.ok) {
          setSave({ kind: "error", message: result.error });
          return;
        }
        if ("skipped" in result) {
          setSave({ kind: "idle" });
          return;
        }
        if (!itemIdRef.current) {
          itemIdRef.current = result.id;
          isDraftRef.current = true;
          setItemId(result.id);
          setIsDraft(true);
          window.history.replaceState(window.history.state, "", `/admin/items/${result.id}`);
        }
        componentsDirtyRef.current = false;
        lastSavedRef.current = signature({ ...input, id: itemIdRef.current });
        setSave({ kind: "saved", at: new Date() });
      } catch {
        setSave({ kind: "error", message: "Sem conexão. Vou tentar de novo quando você mexer." });
      }
    })();

    inFlightRef.current = work;
    await work;
    inFlightRef.current = null;
    if (dirtyAgainRef.current) {
      dirtyAgainRef.current = false;
      void runAutosave();
    }
  }

  function scheduleAutosave(delay = 900) {
    pendingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void runAutosave(), delay);
  }

  // Any change to the form schedules a background save.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (item) lastSavedRef.current = signature(buildInput());
      return;
    }
    scheduleAutosave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, price, pieceCount, description, categoryId, imageUrl, isKit, active, components]);

  // Don't lose work when the phone switches apps or the browser tab goes away.
  useEffect(() => {
    function flush() {
      if (document.visibilityState === "hidden" && pendingRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        void runAutosave();
      }
    }
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Field helpers ────────────────────────────────────────────────────
  function componentSuggestions(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return existingComponents.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }

  async function handleSuggestWithAi() {
    if (!imageUrl) return;
    setIsSuggesting(true);
    setError(null);
    try {
      const result = await suggestItemDetails(imageUrl, name);
      if (result.ok) {
        if (!name.trim()) setName(result.name);
        setDescription(result.description);
      } else {
        setError(result.error);
      }
    } finally {
      setIsSuggesting(false);
    }
  }

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>, target: "main" | number) {
    const file = e.target.files?.[0];
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      e.target.value = "";
      setError(invalid);
      return;
    }

    setError(null);
    setPhotoBusy("preparing");
    try {
      // Read and shrink the photo first; only then release the file input (some
      // Android browsers invalidate the file as soon as the input is cleared).
      const prepared = await prepareImage(file);
      setPendingCrop({ file: prepared, target });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui abrir essa foto.");
    } finally {
      e.target.value = "";
      setPhotoBusy(null);
    }
  }

  async function handleCropConfirm(blob: Blob) {
    if (!pendingCrop) return;
    const { target } = pendingCrop;
    setPendingCrop(null);
    setError(null);

    try {
      if (target === "main") {
        setPhotoBusy("uploading");
        setImageUrl(await uploadPhoto(blob, "new"));
      } else {
        setUploadingComponent(target);
        const url = await uploadPhoto(blob, "new");
        updateComponent(target, { photo_url: url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui enviar a foto. Tente de novo.");
    } finally {
      setPhotoBusy(null);
      setUploadingComponent(null);
    }
  }

  function changeComponents(updater: (prev: ItemComponent[]) => ItemComponent[]) {
    componentsDirtyRef.current = true;
    setComponents(updater);
  }

  function addComponent() {
    changeComponents((prev) => [...prev, { name: "", quantity: 1 }]);
  }

  function updateComponent(index: number, patch: Partial<ItemComponent>) {
    changeComponents((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function handleComponentNameChange(index: number, value: string) {
    const match = existingComponents.find((c) => c.name.toLowerCase() === value.toLowerCase());
    updateComponent(index, {
      name: value,
      photo_url: match?.photo_url ?? undefined,
      unit_price: match?.unit_price ?? undefined,
      replacement_value: match?.replacement_value ?? undefined,
    });
  }

  function removeComponent(index: number) {
    changeComponents((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Dê um nome ao item para salvar.");
      return;
    }
    startTransition(async () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (inFlightRef.current) await inFlightRef.current;
      const result = await saveItem({ ...buildInput(latestRef.current.active), syncComponents: true });
      if (result?.error) setError(result.error);
    });
  }

  const namedComponents = components.filter((c) => c.name.trim());
  const subItemsTotal =
    Math.round(namedComponents.reduce((sum, c) => sum + (c.unit_price ?? 0) * (c.quantity || 1), 0) * 100) / 100;
  const subItemsMissingValue = namedComponents.filter((c) => !c.unit_price).length;
  const subItemsPieces = namedComponents.reduce((sum, c) => sum + (c.quantity || 1), 0);
  const subItemsReplacement =
    Math.round(namedComponents.reduce((sum, c) => sum + (c.replacement_value ?? 0) * (c.quantity || 1), 0) * 100) / 100;

  const photoLabel =
    photoBusy === "preparing" ? "Preparando foto…" : photoBusy === "uploading" ? "Enviando…" : imageUrl ? "Trocar foto" : "Escolher foto";

  const statusText =
    save.kind === "saving"
      ? "Salvando…"
      : save.kind === "error"
        ? save.message
        : save.kind === "saved"
          ? `Salvo às ${save.at.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
          : itemId
            ? "As alterações são salvas sozinhas."
            : "Comece a preencher: o item é salvo sozinho.";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Photo */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-neutral-900">Foto do item</p>
          <div className="relative mx-auto mb-3 aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-xl bg-neutral-100 lg:max-w-none">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">Sem foto</div>
            )}
            {photoBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white">
                {photoBusy === "preparing" ? "Preparando…" : "Enviando…"}
              </div>
            )}
          </div>
          <label
            className={`block cursor-pointer rounded-lg border border-dashed border-neutral-300 px-3 py-3 text-center text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 ${
              photoBusy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {photoLabel}
            <input type="file" accept="image/*" onChange={(e) => pickPhoto(e, "main")} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleSuggestWithAi}
            disabled={!imageUrl || isSuggesting}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2.5 text-center text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✨ {isSuggesting ? "Gerando..." : "Sugerir nome e descrição com IA"}
          </button>
        </section>

        {/* Basic info */}
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm font-semibold text-neutral-900">Informações do item</p>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Tipo de item</label>
            <div className="flex gap-2">
              {[
                { label: "Kit", value: true },
                { label: "Item avulso", value: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setIsKit(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    isKit === opt.value
                      ? "border-[var(--accent-strong)] bg-[var(--accent-strong)] text-white"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              Kit = vários itens juntos (ex: painel + mesa + acessórios). Item avulso = uma peça só.
            </p>
          </div>

          <div>
            <label htmlFor="item-name" className="mb-1 block text-xs font-medium text-neutral-500">
              Nome
            </label>
            <input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Painel Redondo Baby"
              maxLength={120}
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="item-category" className="mb-1 block text-xs font-medium text-neutral-500">
                Categoria
              </label>
              <select
                id="item-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="item-price" className="mb-1 block text-xs font-medium text-neutral-500">
                Preço (R$)
              </label>
              <input
                id="item-price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(/\d/.test(e.target.value) ? formatMoneyTyping(e.target.value) : "")}
                placeholder="0,00"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="item-pieces" className="mb-1 block text-xs font-medium text-neutral-500">
                Qtd. de peças
              </label>
              <input
                id="item-pieces"
                type="text"
                inputMode="numeric"
                value={pieceCount}
                onChange={(e) => setPieceCount(e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="item-description" className="mb-1 block text-xs font-medium text-neutral-500">
              Descrição
            </label>
            <textarea
              id="item-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes que aparecem na página do item na vitrine"
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg bg-neutral-50 px-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">Mostrar na vitrine</p>
              <p className="text-[11px] text-neutral-500">
                {isDraft
                  ? "Rascunho: só aparece para os clientes depois de tocar em Salvar item."
                  : active
                    ? "Os clientes veem este item."
                    : "Oculto: os clientes não veem este item."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              aria-label="Mostrar na vitrine"
              onClick={() => setActive((v) => !v)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                active ? "bg-[var(--accent-strong)]" : "bg-neutral-300"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>
      </div>

      {/* Kit components */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-neutral-900">Itens inclusos no kit</p>
          <button
            type="button"
            onClick={addComponent}
            className="shrink-0 rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold hover:bg-neutral-50"
          >
            + Adicionar item
          </button>
        </div>
        <p className="mb-3 text-xs text-neutral-500">
          Aparece na vitrine e é detalhado no contrato, com foto, valor e reposição (se quebrar ou perder).{" "}
          <span className="font-medium text-neutral-700">
            Os valores são de 1 unidade: a quantidade multiplica na soma.
          </span>{" "}
          Cada sub-item é salvo assim que você preenche. Use o mesmo nome de itens de outros kits para
          reaproveitar os dados.
        </p>

        {components.length === 0 && (
          <p className="rounded-lg bg-neutral-50 px-3 py-3 text-center text-xs text-neutral-400">
            Nenhum sub-item adicionado.
          </p>
        )}

        <div className="space-y-2">
          {components.map((c, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-neutral-100 p-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-neutral-100">
                  {c.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                      {uploadingComponent === i ? "..." : "foto"}
                    </span>
                  )}
                  {uploadingComponent === i && c.photo_url && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px] font-semibold text-white">
                      ...
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Foto do sub-item"
                    onChange={(e) => pickPhoto(e, i)}
                  />
                </label>
                <div className="relative min-w-[140px] flex-1">
                  <input
                    value={c.name}
                    onChange={(e) => {
                      handleComponentNameChange(i, e.target.value);
                      setSuggestFor(i);
                    }}
                    onFocus={() => setSuggestFor(i)}
                    onBlur={() => setSuggestFor((v) => (v === i ? null : v))}
                    placeholder="Ex: Urso Frederico"
                    autoComplete="off"
                    aria-label="Nome do sub-item"
                    className={`${inputClass} py-2.5`}
                  />
                  {suggestFor === i && componentSuggestions(c.name).length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
                      {componentSuggestions(c.name).map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            handleComponentNameChange(i, s.name);
                            setSuggestFor(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-neutral-50"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-neutral-100">
                            {s.photo_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.photo_url} alt="" className="h-full w-full object-cover" />
                            )}
                          </span>
                          <span className="truncate">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeComponent(i)}
                  className="shrink-0 rounded-full border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-2 sm:grid-cols-3 sm:pl-[56px]">
                <div>
                  <label className="mb-0.5 block text-[11px] font-medium text-neutral-500">Quantidade</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    onKeyDown={blockNonNumericKeys}
                    value={c.quantity}
                    onChange={(e) => updateComponent(i, { quantity: Number(e.target.value) || 1 })}
                    className={`${inputClass} px-2 py-2`}
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] font-medium text-neutral-500">Valor de 1 unidade (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={c.unit_price != null ? moneyToDisplay(c.unit_price) : ""}
                    onChange={(e) => {
                      const hasDigits = /\d/.test(e.target.value);
                      updateComponent(i, { unit_price: hasDigits ? parseMoneyTyping(e.target.value) : undefined });
                    }}
                    placeholder="0,00"
                    className={`${inputClass} px-2 py-2`}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-0.5 block text-[11px] font-medium text-neutral-500">
                    Reposição de 1 unidade (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={c.replacement_value != null ? moneyToDisplay(c.replacement_value) : ""}
                    onChange={(e) => {
                      const hasDigits = /\d/.test(e.target.value);
                      updateComponent(i, { replacement_value: hasDigits ? parseMoneyTyping(e.target.value) : undefined });
                    }}
                    placeholder="0,00"
                    className={`${inputClass} px-2 py-2`}
                  />
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 sm:pl-[56px]">
                {c.unit_price ? (
                  <>
                    {c.quantity} × R$ {moneyToDisplay(c.unit_price)} ={" "}
                    <span className="font-semibold text-neutral-800">
                      R$ {moneyToDisplay(Math.round(c.unit_price * c.quantity * 100) / 100)}
                    </span>
                  </>
                ) : (
                  "Informe o valor de 1 unidade para ver o total deste sub-item."
                )}
              </p>
            </div>
          ))}
        </div>

        {components.length > 0 && (
          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4" aria-live="polite">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-800">Soma dos sub-itens</p>
                <p className="text-[11px] text-neutral-500">
                  {namedComponents.length} {namedComponents.length === 1 ? "sub-item" : "sub-itens"} · {subItemsPieces}{" "}
                  {subItemsPieces === 1 ? "peça" : "peças"}
                </p>
              </div>
              <p className="text-xl font-bold tabular-nums text-neutral-900">R$ {moneyToDisplay(subItemsTotal)}</p>
            </div>

            {subItemsReplacement > 0 && (
              <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-neutral-200 pt-2">
                <p className="text-xs text-neutral-600">Reposição, se tudo quebrar ou for perdido</p>
                <p className="text-sm font-semibold tabular-nums text-neutral-700">
                  R$ {moneyToDisplay(subItemsReplacement)}
                </p>
              </div>
            )}

            <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
              Conta: valor de 1 unidade × quantidade, somado. É só para você conferir e{" "}
              <span className="font-medium">não muda o preço do item</span>.
              {subItemsMissingValue > 0 &&
                ` ${subItemsMissingValue} ${subItemsMissingValue === 1 ? "sub-item está" : "sub-itens estão"} sem valor e não entram na soma.`}
            </p>
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div
        className="admin-surface sticky bottom-0 z-20 -mx-4 flex items-center justify-between gap-3 border-t border-neutral-200 bg-white px-4 pt-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <p
          className={`min-w-0 text-xs ${save.kind === "error" ? "font-medium text-red-600" : "text-neutral-500"}`}
          aria-live="polite"
        >
          {statusText}
          {save.kind !== "error" && (isDraft || !active) && (
            <span className="block text-[11px] font-medium text-amber-600">
              {isDraft ? "Rascunho: os clientes só veem depois de Salvar item" : "Oculto: os clientes não veem este item"}
            </span>
          )}
        </p>
        <button
          type="submit"
          disabled={isPending || photoBusy !== null}
          className="h-11 shrink-0 rounded-full bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar item"}
        </button>
      </div>

      {pendingCrop && (
        <ImageCropper
          file={pendingCrop.file}
          aspectRatio={pendingCrop.target === "main" ? 3 / 4 : 1}
          onCancel={() => setPendingCrop(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </form>
  );
}
