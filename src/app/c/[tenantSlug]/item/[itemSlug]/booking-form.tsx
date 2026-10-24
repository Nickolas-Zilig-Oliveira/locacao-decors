"use client";

import { useMemo, useState, useTransition } from "react";
import { createBooking } from "./actions";

type Props = {
  tenantId: string;
  itemId: string;
  blockedDates: string[];
  accent: string;
};

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function BookingForm({ tenantId, itemId, blockedDates, accent }: Props) {
  const [open, setOpen] = useState(false);
  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = [0, 1].map((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return d;
  });

  function buildDays(monthStart: Date) {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const firstWeekday = monthStart.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  }

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
        setMessage({ type: "ok", text: "Reserva enviada! O locador vai confirmar em breve." });
        setSelectedDate(null);
        setName("");
        setPhone("");
        setNotes("");
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

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-1 font-semibold">Verificar disponibilidade</h2>
      <p className="mb-4 text-sm text-white/50">
        Escolha a data desejada e informe seus dados para solicitar a reserva.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {months.map((monthStart) => (
          <div key={monthStart.toISOString()}>
            <p className="mb-2 text-sm font-medium capitalize text-white/80">
              {monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                <span key={i} className="text-white/30">
                  {d}
                </span>
              ))}
              {buildDays(monthStart).map((day, i) => {
                if (!day) return <span key={i} />;
                const key = toDateKey(day);
                const isPast = day < today;
                const isBlocked = blocked.has(key);
                const isSelected = selectedDate === key;
                const disabled = isPast || isBlocked;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(key)}
                    className={`aspect-square rounded text-xs ${
                      disabled
                        ? "cursor-not-allowed text-white/20 line-through"
                        : "text-white hover:bg-white/10"
                    }`}
                    style={isSelected ? { backgroundColor: accent } : undefined}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Data selecionada</label>
          <input
            readOnly
            value={selectedDate ?? ""}
            placeholder="Selecione no calendário acima"
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
            onChange={(e) => setPhone(e.target.value)}
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

        {message && (
          <p className={message.type === "ok" ? "text-sm text-green-400" : "text-sm text-red-400"}>
            {message.text}
          </p>
        )}

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
