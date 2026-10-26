"use client";

import { useMemo, useState, useTransition } from "react";
import { formatPhone } from "@/lib/masks";
import { whatsappLink } from "@/lib/whatsapp";
import { ChevronLeftIcon, ChevronRightIcon, WhatsAppIcon } from "../../icons";
import { storeTheme } from "../../store-theme";
import { createBooking } from "./actions";

type Props = {
  tenantId: string;
  itemId: string;
  itemName: string;
  tenantPhone: string | null;
  blockedDates: string[];
  accent: string;
  dark: boolean;
};

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const MAX_MONTHS_AHEAD = 11;
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function BookingForm({ tenantId, itemId, itemName, tenantPhone, blockedDates, accent, dark }: Props) {
  const theme = storeTheme(dark);
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
    const days: (Date | null)[] = Array(start.getDay()).fill(null);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  }

  const waConfirmLink =
    selectedDate && tenantPhone
      ? whatsappLink(
          tenantPhone,
          `Olá! Acabei de solicitar a reserva de "${itemName}" para ${formatDateLabel(selectedDate).toLowerCase()}. Meu nome é ${name}.`
        )
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) {
      setMessage({ type: "error", text: "Escolha uma data disponível no calendário." });
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
      setMessage(result.ok ? { type: "ok", text: "" } : { type: "error", text: result.error });
    });
  }

  const label = `mb-1.5 block text-[13px] font-semibold ${theme.softText}`;
  const field = `w-full rounded-xl border-0 px-3.5 py-2.5 text-[15px] outline-none transition-shadow ${theme.field}`;
  const navBtn = `flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-25 ${theme.iconBtn}`;

  if (!open) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setOpen(true)}
          className="h-12 w-full rounded-full px-8 text-[15px] font-semibold text-white shadow-[0_12px_28px_-12px_var(--accent)] transition-transform duration-200 active:scale-[0.98] sm:w-auto"
          style={{ backgroundColor: accent }}
        >
          Ver datas disponíveis
        </button>
      </div>
    );
  }

  if (message?.type === "ok") {
    return (
      <div className={`mt-8 rounded-3xl p-6 text-center ${theme.card}`}>
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accent }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="mt-4 font-display text-xl font-bold">Pedido enviado</p>
        <p className={`mx-auto mt-2 max-w-sm text-sm leading-relaxed ${theme.muted}`}>
          Registramos seu pedido para{" "}
          <span className={`font-semibold ${theme.text}`}>{formatDateLabel(selectedDate!).toLowerCase()}</span>. Confirme no
          WhatsApp para garantir a data e combinar pagamento e retirada.
        </p>
        {waConfirmLink && (
          <a
            href={waConfirmLink}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-[15px] font-semibold text-white transition-transform duration-200 active:scale-[0.98]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Confirmar no WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <section className={`mt-8 rounded-3xl p-5 sm:p-6 ${theme.card}`}>
      <h2 className="font-display text-xl font-bold">Escolha a data</h2>
      <p className={`mt-1 text-sm ${theme.muted}`}>Datas riscadas já estão reservadas.</p>

      <div className="mb-3 mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((v) => Math.max(0, v - 1))}
          disabled={monthOffset === 0}
          className={navBtn}
          aria-label="Mês anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <p className="font-display text-base font-bold capitalize">
          {monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setMonthOffset((v) => Math.min(MAX_MONTHS_AHEAD, v + 1))}
          disabled={monthOffset === MAX_MONTHS_AHEAD}
          className={navBtn}
          aria-label="Próximo mês"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className={`pb-1.5 text-[11px] font-semibold ${theme.muted}`}>
            {d}
          </span>
        ))}
        {buildDays(monthStart).map((day, i) => {
          if (!day) return <span key={i} />;
          const key = toDateKey(day);
          const isPast = day < today;
          const isToday = key === toDateKey(today);
          const isBlocked = blocked.has(key);
          const isSelected = selectedDate === key;
          const disabled = isPast || isBlocked;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                setSelectedDate(key);
                setMessage(null);
              }}
              aria-pressed={isSelected}
              aria-label={`${day.getDate()}${isBlocked ? ", reservado" : ""}`}
              className={`relative aspect-square rounded-xl text-sm font-semibold tabular-nums transition-colors duration-150 ${
                disabled
                  ? `cursor-not-allowed ${dark ? "text-white/20" : "text-neutral-300"} ${isBlocked ? "line-through" : ""}`
                  : isSelected
                    ? "text-white"
                    : dark
                      ? "hover:bg-white/[0.08]"
                      : "hover:bg-neutral-900/[0.05]"
              }`}
              style={isSelected ? { backgroundColor: accent } : undefined}
            >
              {day.getDate()}
              {isToday && !isSelected && (
                <span
                  className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className={`mt-6 space-y-4 border-t pt-6 ${theme.divider}`}>
        <div
          className={`rounded-xl px-3.5 py-3 text-sm ${selectedDate ? "" : theme.muted} ${theme.cardImgBg}`}
          aria-live="polite"
        >
          {selectedDate ? (
            <>
              Data escolhida: <span className="font-semibold">{formatDateLabel(selectedDate)}</span>
            </>
          ) : (
            "Toque em uma data disponível acima."
          )}
        </div>
        <div>
          <label htmlFor="bk-name" className={label}>
            Seu nome
          </label>
          <input
            id="bk-name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="bk-phone" className={label}>
            WhatsApp
          </label>
          <input
            id="bk-phone"
            required
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            inputMode="numeric"
            placeholder="(11) 90000-0000"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="bk-notes" className={label}>
            Observações <span className={`font-normal ${theme.muted}`}>(opcional)</span>
          </label>
          <textarea
            id="bk-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Horário, local do evento, dúvidas…"
            className={`${field} resize-none`}
          />
        </div>

        {message?.type === "error" && (
          <p className={`text-sm font-medium ${dark ? "text-red-300" : "text-red-600"}`} role="alert">
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-full text-[15px] font-semibold text-white transition-[transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: accent }}
        >
          {isPending ? "Enviando…" : "Solicitar reserva"}
        </button>
      </form>
    </section>
  );
}
