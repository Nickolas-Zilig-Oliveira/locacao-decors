"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { formatPhone } from "@/lib/masks";
import { whatsappLink } from "@/lib/whatsapp";
import { ChevronLeftIcon, ChevronRightIcon, WhatsAppIcon } from "../../icons";
import { formatBRL, storeTheme } from "../../store-theme";
import { createBooking } from "./actions";

type Props = {
  tenantId: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  itemImage: string | null;
  tenantPhone: string | null;
  catalogHref: string;
  blockedDates: string[];
  accent: string;
  dark: boolean;
};

type Step = "date" | "details" | "done";

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
const STEPS: { id: Step; label: string }[] = [
  { id: "date", label: "Data" },
  { id: "details", label: "Seus dados" },
  { id: "done", label: "Pronto" },
];

export function BookingForm({
  tenantId,
  itemId,
  itemName,
  itemPrice,
  itemImage,
  tenantPhone,
  catalogHref,
  blockedDates,
  accent,
  dark,
}: Props) {
  const theme = storeTheme(dark);
  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [monthOffset, setMonthOffset] = useState(0);
  const monthStart = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = monthStart.toLocaleDateString("pt-BR", { month: "long" });
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de ${monthStart.getFullYear()}`;
  const stepIndex = STEPS.findIndex((s) => s.id === step);

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) {
      setStep("date");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createBooking({
        tenantId,
        itemId,
        eventDate: selectedDate,
        customerName: name,
        customerPhone: phone,
        notes,
      });
      if (result.ok) setStep("done");
      else setError(result.error);
    });
  }

  const label = `mb-1.5 block text-[13px] font-semibold ${theme.softText}`;
  const field = `w-full rounded-xl border-0 px-3.5 py-3 text-[15px] outline-none transition-shadow ${theme.field}`;
  const navBtn = `flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-25 ${theme.iconBtn}`;
  const primary =
    "h-12 w-full rounded-full text-[15px] font-semibold text-white transition-[transform,opacity] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45";
  const ghost = `h-12 shrink-0 rounded-full px-5 text-[15px] font-semibold transition-colors duration-200 ${theme.iconBtn}`;

  const summary = (
    <div className={`flex items-center gap-3.5 rounded-2xl p-3 ${theme.cardImgBg}`}>
      <div className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-xl ${theme.cardImgBg}`}>
        {itemImage && <Image src={itemImage} alt="" fill sizes="56px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{itemName}</p>
        <p className={`truncate text-[13px] ${selectedDate ? theme.softText : theme.muted}`}>
          {selectedDate ? formatDateLabel(selectedDate) : "Escolha uma data"}
        </p>
      </div>
      <p className="shrink-0 font-display text-base font-bold tabular-nums" style={{ color: accent }}>
        {formatBRL(itemPrice)}
      </p>
    </div>
  );

  return (
    <section id="reserva" className={`mt-10 scroll-mt-24 rounded-3xl p-5 sm:p-6 ${theme.card}`} aria-label="Reservar este item">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold">
          {step === "done" ? "Pedido enviado" : "Reserve a sua data"}
        </h2>
        <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Etapas">
          {STEPS.map((s, i) => (
            <li key={s.id} aria-current={i === stepIndex ? "step" : undefined}>
              <div className={`h-1 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-neutral-900/10"}`}>
                <div
                  className="h-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ backgroundColor: accent, transform: i <= stepIndex ? "scaleX(1)" : "scaleX(0)" }}
                />
              </div>
              <span className={`mt-1.5 block text-[12px] font-semibold ${i <= stepIndex ? "" : theme.muted}`}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {step === "date" && (
        <div key="date" className="anim-step">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthOffset((v) => Math.max(0, v - 1))}
              disabled={monthOffset === 0}
              className={navBtn}
              aria-label="Mês anterior"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <p className="font-display text-base font-bold">
              {monthLabel}
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
                  onClick={() => setSelectedDate(key)}
                  aria-pressed={isSelected}
                  aria-label={`${day.getDate()}${isBlocked ? ", reservado" : ""}`}
                  className={`relative aspect-square rounded-2xl text-sm font-semibold tabular-nums transition-[background-color,transform] duration-200 active:scale-90 ${
                    disabled
                      ? `cursor-not-allowed ${dark ? "text-white/20" : "text-neutral-300"} ${isBlocked ? "line-through" : ""}`
                      : isSelected
                        ? "scale-[1.04] text-white"
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
          <p className={`mt-3 text-[12px] ${theme.muted}`}>Datas riscadas já estão reservadas.</p>

          <div className="mt-5 space-y-4">
            {summary}
            <button
              type="button"
              disabled={!selectedDate}
              onClick={() => setStep("details")}
              className={primary}
              style={{ backgroundColor: accent }}
            >
              {selectedDate ? "Continuar" : "Escolha uma data"}
            </button>
          </div>
        </div>
      )}

      {step === "details" && (
        <form key="details" onSubmit={submit} className="anim-step space-y-4">
          {summary}
          <button
            type="button"
            onClick={() => setStep("date")}
            className="text-[13px] font-semibold underline-offset-4 hover:underline"
            style={{ color: accent }}
          >
            Trocar a data
          </button>

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

          {error && (
            <p className={`text-sm font-medium ${dark ? "text-red-300" : "text-red-600"}`} role="alert">
              {error}
            </p>
          )}

          <p className={`text-[12px] leading-relaxed ${theme.muted}`}>
            Você ainda não paga nada. Depois do pedido, confirmamos a data com você no WhatsApp.
          </p>

          <div className="flex gap-2.5">
            <button type="button" onClick={() => setStep("date")} className={ghost}>
              Voltar
            </button>
            <button type="submit" disabled={isPending} className={primary} style={{ backgroundColor: accent }}>
              {isPending ? "Enviando…" : "Solicitar reserva"}
            </button>
          </div>
        </form>
      )}

      {step === "done" && selectedDate && (
        <div key="done" className="anim-step text-center">
          <div
            className="anim-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden>
              <path className="anim-check" d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className={`mx-auto mt-5 max-w-sm text-[15px] leading-relaxed ${theme.softText}`} role="status">
            Registramos o seu pedido para <span className={`font-semibold ${theme.text}`}>{formatDateLabel(selectedDate).toLowerCase()}</span>.
            Falta só um passo: confirme no WhatsApp para garantir a data e combinar pagamento e retirada.
          </p>
          <div className="mx-auto mt-5 max-w-sm text-left">{summary}</div>
          {waConfirmLink && (
            <a
              href={waConfirmLink}
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-5 flex h-12 max-w-sm items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-[15px] font-semibold text-white transition-transform duration-200 active:scale-[0.98]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Confirmar no WhatsApp
            </a>
          )}
          <Link href={catalogHref} className={`mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline ${theme.softText}`}>
            Ver mais itens
          </Link>
        </div>
      )}
    </section>
  );
}
