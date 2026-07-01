"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Send } from "lucide-react";
import { slugify } from "@/lib/format";
import type { ClubApplication } from "@/lib/types";

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; application: ClubApplication }
  | { status: "error"; message: string };

export function ClubApplicationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const suggestedSlug = useMemo(() => slugify(name), [name]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });
    const form = new FormData(event.currentTarget);
    const applicantUserId = window.localStorage.getItem("katnut_user_id") ?? "00000000-0000-4000-8000-000000000001";
    const proofLinks = String(form.get("proof_links") || "")
      .split(/\s+/)
      .map((link) => link.trim())
      .filter(Boolean);
    const tags = String(form.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await fetch("/api/club-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicant_user_id: applicantUserId,
        proposed_name: name,
        proposed_slug: slug || suggestedSlug,
        description: String(form.get("description") || ""),
        telegram_url: String(form.get("telegram_url") || ""),
        proof_text: String(form.get("proof_text") || ""),
        proof_links: proofLinks,
        city: String(form.get("city") || "Москва"),
        tags
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState({ status: "error", message: result.error ?? "Не удалось отправить заявку" });
      return;
    }
    setState({ status: "success", application: result.application });
  }

  if (state.status === "success") {
    return (
      <section className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          <Check size={24} />
        </div>
        <h1 className="mt-4 text-2xl font-black">Заявка отправлена</h1>
        <p className="mt-2 text-sm text-app-muted">
          {state.application.proposed_name} попал на модерацию. Статус можно смотреть в профиле.
        </p>
        <Link href="/profile" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-app-accent text-sm font-bold text-app-accentText">
          Открыть профиль
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <label className="block text-sm font-bold" htmlFor="proposed_name">
          Название клуба
          <input
            id="proposed_name"
            name="proposed_name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slug) setSlug(slugify(event.target.value));
            }}
            required
            minLength={3}
            className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 outline-none focus:border-app-accent"
          />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="proposed_slug">
          Slug
          <input
            id="proposed_slug"
            name="proposed_slug"
            value={slug || suggestedSlug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            required
            className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 outline-none focus:border-app-accent"
          />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="city">
          Город
          <input id="city" name="city" defaultValue="Москва" className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3" />
        </label>
      </div>

      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <label className="block text-sm font-bold" htmlFor="description">
          Короткое описание
          <textarea id="description" name="description" rows={4} required minLength={20} className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3" />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="telegram_url">
          Telegram-ссылка клуба
          <input id="telegram_url" name="telegram_url" type="url" placeholder="https://t.me/..." required className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3" />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="tags">
          Теги через запятую
          <input id="tags" name="tags" placeholder="road, gravel, coffee" className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3" />
        </label>
      </div>

      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <label className="block text-sm font-bold" htmlFor="proof_text">
          Как проверить, что вы представитель клуба
          <textarea id="proof_text" name="proof_text" rows={4} required minLength={10} className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3" />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="proof_links">
          Ссылки-доказательства
          <textarea id="proof_links" name="proof_links" rows={3} placeholder="По одной ссылке или через пробел" className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3" />
        </label>
      </div>

      {state.status === "error" && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.status === "loading"}
        className="sticky bottom-24 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-app-accent text-base font-bold text-app-accentText shadow-soft disabled:opacity-70"
      >
        {state.status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Отправить заявку
      </button>
    </form>
  );
}
