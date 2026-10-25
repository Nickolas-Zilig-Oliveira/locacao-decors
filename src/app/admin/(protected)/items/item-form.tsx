"use client";

import { useState, useTransition } from "react";
import type { Category, Item, ItemComponent, KitComponentCatalogEntry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatMoneyTyping, moneyToDisplay, parseMoneyTyping } from "@/lib/masks";
import { validateImageFile } from "@/lib/upload";
import { ImageCropper } from "@/components/image-cropper";
import { saveItem } from "./actions";

function blockNonNumericKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
}

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
  const [imageUrl, setImageUrl] = useState<string>(item?.images?.[0] ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [components, setComponents] = useState<ItemComponent[]>(item?.components ?? []);
  const [uploadingComponent, setUploadingComponent] = useState<number | null>(null);
  const [suggestFor, setSuggestFor] = useState<number | null>(null);
  const [pendingCrop, setPendingCrop] = useState<{ file: File; target: "main" | number } | null>(null);

  function componentSuggestions(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return existingComponents.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }

  async function uploadToStorage(file: File) {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${item?.tenant_id ?? "new"}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("item-photos").upload(path, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const invalidReason = validateImageFile(file);
    if (invalidReason) {
      setError(invalidReason);
      return;
    }

    setError(null);
    setPendingCrop({ file, target: "main" });
  }

  function handleComponentPhotoChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const invalidReason = validateImageFile(file);
    if (invalidReason) {
      setError(invalidReason);
      return;
    }

    setError(null);
    setPendingCrop({ file, target: index });
  }

  async function handleCropConfirm(blob: Blob) {
    if (!pendingCrop) return;
    const { target } = pendingCrop;
    const croppedFile = new File([blob], "foto.jpg", { type: "image/jpeg" });
    setPendingCrop(null);

    if (target === "main") {
      setIsUploading(true);
      setError(null);
      try {
        setImageUrl(await uploadToStorage(croppedFile));
      } catch {
        setError("Não foi possível enviar a foto. Tente novamente.");
      } finally {
        setIsUploading(false);
      }
    } else {
      setUploadingComponent(target);
      setError(null);
      try {
        const url = await uploadToStorage(croppedFile);
        updateComponent(target, { photo_url: url });
      } catch {
        setError("Não foi possível enviar a foto do sub-item. Tente novamente.");
      } finally {
        setUploadingComponent(null);
      }
    }
  }

  function addComponent() {
    setComponents((prev) => [...prev, { name: "", quantity: 1 }]);
  }

  function updateComponent(index: number, patch: Partial<ItemComponent>) {
    setComponents((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function handleComponentNameChange(index: number, name: string) {
    const match = existingComponents.find((c) => c.name.toLowerCase() === name.toLowerCase());
    updateComponent(index, {
      name,
      photo_url: match?.photo_url ?? undefined,
      unit_price: match?.unit_price ?? undefined,
      replacement_value: match?.replacement_value ?? undefined,
    });
  }

  function removeComponent(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("image_url", imageUrl);
    formData.set("components_json", JSON.stringify(components));
    startTransition(async () => {
      const result = await saveItem(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-3xl space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Photo */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-neutral-900">Foto do item</p>
          <div className="mb-3 aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                Sem foto
              </div>
            )}
          </div>
          <label className="block cursor-pointer rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-center text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50">
            {isUploading ? "Enviando..." : "Trocar foto"}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </section>

        {/* Basic info */}
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-neutral-900">Informações do item</p>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Nome</label>
            <input
              name="name"
              defaultValue={item?.name}
              placeholder="Ex: Painel Redondo Baby"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Categoria</label>
              <select
                name="category_id"
                defaultValue={item?.category_id ?? ""}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
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
              <label className="mb-1 block text-xs font-medium text-neutral-500">Preço (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                name="price"
                defaultValue={item ? moneyToDisplay(item.price) : ""}
                onChange={(e) => {
                  e.target.value = formatMoneyTyping(e.target.value);
                }}
                placeholder="0,00"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Qtd. de peças</label>
              <input
                type="number"
                inputMode="numeric"
                name="piece_count"
                min="0"
                onKeyDown={blockNonNumericKeys}
                defaultValue={item?.piece_count ?? ""}
                placeholder="0"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Descrição</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={item?.description ?? ""}
              placeholder="Detalhes que aparecem na página do item na vitrine"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </section>
      </div>

      {/* Kit components */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">Itens inclusos no kit</p>
          <button
            type="button"
            onClick={addComponent}
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium hover:bg-neutral-50"
          >
            + Adicionar item
          </button>
        </div>
        <p className="mb-3 text-xs text-neutral-500">
          Aparece na vitrine (&quot;Itens inclusos no Kit&quot;) e é detalhado no contrato quando este
          kit for usado — com foto, valor e valor de reposição (caso quebre/perca). O nome sugere
          itens já cadastrados em outros kits — use o mesmo nome para reaproveitar os dados
          automaticamente.
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
                <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-neutral-100">
                  {c.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[9px] text-neutral-400">
                      {uploadingComponent === i ? "..." : "foto"}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleComponentPhotoChange(i, e)}
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
                    className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
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
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
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
                  className="shrink-0 rounded-full border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 pl-[48px]">
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-neutral-400">Qtd.</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    onKeyDown={blockNonNumericKeys}
                    value={c.quantity}
                    onChange={(e) => updateComponent(i, { quantity: Number(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-neutral-400">Valor (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={c.unit_price != null ? moneyToDisplay(c.unit_price) : ""}
                    onChange={(e) => {
                      const hasDigits = /\d/.test(e.target.value);
                      updateComponent(i, {
                        unit_price: hasDigits ? parseMoneyTyping(e.target.value) : undefined,
                      });
                    }}
                    placeholder="0,00"
                    className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-neutral-400">Reposição (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={c.replacement_value != null ? moneyToDisplay(c.replacement_value) : ""}
                    onChange={(e) => {
                      const hasDigits = /\d/.test(e.target.value);
                      updateComponent(i, {
                        replacement_value: hasDigits ? parseMoneyTyping(e.target.value) : undefined,
                      });
                    }}
                    placeholder="0,00"
                    className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar item"}
      </button>

      {pendingCrop && (
        <ImageCropper
          file={pendingCrop.file}
          onCancel={() => setPendingCrop(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </form>
  );
}
