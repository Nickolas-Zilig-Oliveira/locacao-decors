"use client";

import { useState, useTransition } from "react";
import type { Tenant } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
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
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
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

        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-neutral-900">Dados da loja</p>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Nome da loja</label>
            <input
              name="name"
              defaultValue={tenant.name}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Cidade</label>
              <input
                name="city"
                defaultValue={tenant.city ?? ""}
                placeholder="Ex: São Paulo - SP"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
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
                defaultValue={tenant.phone ?? ""}
                placeholder="(11) 90000-0000"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">E-mail</label>
              <input
                type="email"
                name="email"
                defaultValue={tenant.email ?? ""}
                placeholder="contato@sualoja.com"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">CNPJ (opcional)</label>
              <input
                name="cnpj"
                defaultValue={tenant.cnpj ?? ""}
                placeholder="00.000.000/0000-00"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Endereço</label>
              <input
                name="address"
                defaultValue={tenant.address ?? ""}
                placeholder="Rua, número, bairro"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </section>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Configurações salvas.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
