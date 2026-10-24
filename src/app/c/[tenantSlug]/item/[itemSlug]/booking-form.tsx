"use client";

import { useMemo, useState, useTransition } from "react";
import { formatPhone } from "@/lib/masks";
import { whatsappLink } from "@/lib/whatsapp";
import { createBooking } from "./actions";

type Props = {
  tenantId: string;
  itemId: string;
  itemName: string;
  tenantPhone: string | null;
  blockedDates: string[];
  accent: string;
};

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const MAX_MONTHS_AHEAD = 11;

export function BookingForm({ tenantId, itemId, itemName, tenantPhone, blockedDates, accent }: Props) {
  const [open, setOpen] = useState(false);
  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [monthOffset, setMonthOffset] = useState(0);
  const monthStart = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  function buildDays(start: Date) {
    const year = start.getFullYear();
    const month = start.getMonth();
    const firstWeekday = start.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  }

  const waConfirmLink =
    selectedDate && tenantPhone
      ? whatsappLink(
          tenantPhone,
          `Olá! Acabei de solicitar a reserva de "${itemName}" para o dia ${formatDateLabel(
            selectedDate
          )}. Meu nome é ${name}.`
        )
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) {
      setMessage({ type: "error", text: "Selecione uma data disponível." });
      return;
    }
    startTransition(async () => {
      const result = await createBooking({
        tenantId,
        itemId,
        eventDate: selectedDate,
        customerName: name,
        customerPhone: phone,
        notes,
      });
      if (result.ok) {
        setMessage({ type: "ok", text: "Reserva enviada! Confirme no WhatsApp pra garantir sua data." });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  if (!open) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-full py-3 text-sm font-semibold text-white shadow-lg sm:w-auto sm:px-8"
          style={{ backgroundColor: accent }}
        >
          Verificar disponibilidade
        </button>
      </div>
    );
  }

  if (message?.type === "ok") {
    return (
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-lg font-semibold text-green-400">Reserva enviada!</p>
        <p className="mt-1 text-sm text-white/60">
          Pedido registrado para <span className="font-medium text-white">{formatDateLabel(selectedDate!)}</span>.
          Pra garantir e combinar pagamento e retirada, confirme agora no WhatsApp.
        </p>
        {waConfirmLink && (
          <a
            href={waConfirmLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
          >
            Confirmar no WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-1 font-semibold">Verificar disponibilidade</h2>
      <p className="mb-4 text-sm text-white/50">
        Escolha a data desejada e informe seus dados para solicitar a reserva.
      </p>

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((v) => Math.max(0, v - 1))}
          disabled={monthOffset === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-20"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <p className="text-sm font-semibold capitalize text-white">
          {monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setMonthOffset((v) => Math.min(MAX_MONTHS_AHEAD, v + 1))}
          disabled={monthOffset === MAX_MONTHS_AHEAD}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-20"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} className="pb-1 text-white/30">
            {d}
          </span>
        ))}
        {buildDays(monthStart).map((day, i) => {
          if (!day) return <span key={i} />;
          const key = toDateKey(day);
          const isPast = day < today;
          const isToday = toDateKey(day) === toDateKey(today);
          const isBlocked = blocked.has(key);
          const isSelected = selectedDate === key;
          const disabled = isPast || isBlocked;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedDate(key)}
              className={`relative aspect-square rounded-lg text-sm font-medium transition-colors ${
                disabled
                  ? "cursor-not-allowed text-white/15 line-through"
                  : isSelected
                    ? "text-white"
                    : "text-white hover:bg-white/10"
              } ${isToday && !isSelected ? "ring-1 ring-inset ring-white/30" : ""}`}
              style={isSelected ? { backgroundColor: accent } : undefined}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
          Selecionado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-white/30" />
          Hoje
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          Indisponível
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Data selecionada</label>
          <input
            readOnly
            value={selectedDate ? formatDateLabel(selectedDate) : ""}
            placeholder="Toque numa data disponível acima"
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Seu nome</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">WhatsApp</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            inputMode="numeric"
            placeholder="(11) 90000-0000"
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Observações (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>

        {message && message.type === "error" && <p className="text-sm text-red-400">{message.text}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {isPending ? "Enviando..." : "Solicitar reserva"}
        </button>
      </form>
    </div>
  );
}
