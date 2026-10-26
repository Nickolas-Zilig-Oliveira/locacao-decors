"use client";

import { useState, useTransition } from "react";
import type { Tenant } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatCNPJ, formatPhone } from "@/lib/masks";
import { validateImageFile } from "@/lib/upload";
import { updateTenantSettings } from "./actions";

export function SettingsForm({ tenant }: { tenant: Tenant }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? "");
  const [isUploading, setIsUploading] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const invalidReason = validateImageFile(file);
    if (invalidReason) {
      setError(invalidReason);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${tenant.id}/logo-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("item-photos").upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    } catch {
      setError("Não foi possível enviar a logo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    formData.set("logo_url", logoUrl);
    startTransition(async () => {
      const result = await updateTenantSettings(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form action={handleSubmit} className="max-w-3xl space-y-5">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-neutral-900">Logo da loja</p>
          <div className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: tenant.primary_color }}
              >
                {tenant.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <label className="block cursor-pointer rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-center text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50">
            {isUploading ? "Enviando..." : "Trocar logo"}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </label>
        </section>

        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm font-semibold text-neutral-900">Dados da loja</p>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Nome da loja</label>
            <input
              name="name"
              defaultValue={tenant.name}
              required
              maxLength={15}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
            />
            <p className="mt-1 text-[11px] text-neutral-400">
              Máx. 15 caracteres — nome curto cabe melhor no topo da vitrine.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Cidade</label>
              <input
                name="city"
                defaultValue={tenant.city ?? ""}
                placeholder="Ex: São Paulo - SP"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Cor principal</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="primary_color"
                  defaultValue={tenant.primary_color}
                  className="h-9 w-12 shrink-0 rounded border border-neutral-300"
                />
                <span className="text-xs text-neutral-400">Usada na vitrine e no painel</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Telefone / WhatsApp</label>
              <input
                name="phone"
                defaultValue={tenant.phone ? formatPhone(tenant.phone) : ""}
                onChange={(e) => {
                  e.target.value = formatPhone(e.target.value);
                }}
                inputMode="numeric"
                placeholder="(11) 90000-0000"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">E-mail</label>
              <input
                type="email"
                name="email"
                defaultValue={tenant.email ?? ""}
                placeholder="contato@sualoja.com"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Instagram (opcional)</label>
              <input
                name="instagram"
                defaultValue={tenant.instagram ?? ""}
                placeholder="@sualoja ou link do perfil"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
              />
              <p className="mt-1 text-[11px] text-neutral-400">Aparece como link no rodapé da vitrine.</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">CNPJ (opcional)</label>
              <input
                name="cnpj"
                defaultValue={tenant.cnpj ? formatCNPJ(tenant.cnpj) : ""}
                onChange={(e) => {
                  e.target.value = formatCNPJ(e.target.value);
                }}
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Endereço</label>
              <input
                name="address"
                defaultValue={tenant.address ?? ""}
                placeholder="Rua, número, bairro"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Descrição (aparece na vitrine)
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={tenant.description ?? ""}
              placeholder="Uma frase curta sobre sua loja"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Observações de retirada (aparece no contrato)
            </label>
            <textarea
              name="pickup_notes"
              rows={2}
              defaultValue={tenant.pickup_notes ?? ""}
              placeholder="Ex: retirada das 9h às 18h, de segunda a sábado"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
            />
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Responsável pela loja</p>
          <p className="text-xs text-neutral-400">
            Usado pela Ziligz para falar com você sobre a conta — não aparece na vitrine.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Seu nome</label>
            <input
              name="owner_name"
              defaultValue={tenant.owner_name ?? ""}
              placeholder="Nome completo"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Seu WhatsApp</label>
            <input
              name="owner_phone"
              defaultValue={tenant.owner_phone ? formatPhone(tenant.owner_phone) : ""}
              onChange={(e) => {
                e.target.value = formatPhone(e.target.value);
              }}
              inputMode="numeric"
              placeholder="(11) 90000-0000"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
            />
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Configurações salvas.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[var(--accent-strong)] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
