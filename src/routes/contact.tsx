import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { siteConfig } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(160),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Inquire - ${siteConfig.name}` },
      {
        name: "description",
        content: `Schedule a private viewing or request a sales offer for ${siteConfig.name}.`,
      },
      { property: "og:title", content: `Inquire - ${siteConfig.name}` },
      { property: "og:description", content: "Speak with a senior member of our sales team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("success");
  }

  return (
    <div className="px-6 md:px-12 py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-8 lg:gap-16">
        <div className="col-span-12 lg:col-span-5 space-y-10">
          <div>
            <p className="eyebrow text-brass mb-4">Inquire</p>
            <h1 className="editorial-h text-5xl md:text-6xl text-graphite text-balance">
              A private <em className="italic">conversation.</em>
            </h1>
            <p className="text-graphite/65 mt-6 leading-relaxed">
              Tell us what you're looking for. A senior member of our sales team will respond
              personally, in under one business day.
            </p>
          </div>

          <div className="space-y-5 pt-8 border-t border-graphite/10">
            <ContactRow
              label="Telephone"
              value={siteConfig.contact.phoneDisplay}
              href={`tel:${siteConfig.contact.phoneHref}`}
            />
            <ContactRow
              label="WhatsApp"
              value="Message us instantly"
              href={siteConfig.contact.whatsappHref}
            />
            <ContactRow
              label="Email"
              value={siteConfig.contact.email}
              href={`mailto:${siteConfig.contact.email}`}
            />
            <ContactRow label="Sales Office" value={siteConfig.contact.address} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="bg-card border border-graphite/10 rounded-2xl p-8 md:p-12">
            {status === "success" ? (
              <div className="py-16 text-center">
                <div className="size-16 mx-auto rounded-full bg-brass/15 flex items-center justify-center mb-6">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path
                      d="M5 11l4 4 8-8"
                      stroke="oklch(0.72 0.06 75)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl text-graphite">Thank you</h3>
                <p className="text-graphite/65 mt-3">
                  Your inquiry has been received. We will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                <Input name="name" label="Full name" error={errors.name} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input name="email" label="Email" type="email" error={errors.email} required />
                  <Input
                    name="phone"
                    label="Telephone (optional)"
                    type="tel"
                    error={errors.phone}
                  />
                </div>
                <div>
                  <label className="eyebrow text-graphite/50 block mb-2">Interest</label>
                  <select
                    name="interest"
                    className="w-full bg-canvas border border-graphite/15 rounded-md px-4 py-3 text-sm text-graphite focus:outline-none focus:border-brass"
                  >
                    <option>Schedule a private visit</option>
                    <option>Request a sales offer</option>
                    <option>Information on a specific residence</option>
                    <option>General inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="eyebrow text-graphite/50 block mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    className="w-full bg-canvas border border-graphite/15 rounded-md px-4 py-3 text-sm text-graphite focus:outline-none focus:border-brass resize-none"
                    maxLength={1000}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive mt-1">{errors.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-graphite text-canvas eyebrow hover:bg-brass transition-colors rounded-md"
                >
                  Send inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  name,
  label,
  type = "text",
  error,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="eyebrow text-graphite/50 block mb-2">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={250}
        className="w-full bg-canvas border border-graphite/15 rounded-md px-4 py-3 text-sm text-graphite focus:outline-none focus:border-brass transition-colors"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const Wrap = href ? "a" : "div";
  return (
    <Wrap
      {...(href
        ? {
            href,
            target: href.startsWith("http") ? "_blank" : undefined,
            rel: "noopener noreferrer",
          }
        : {})}
      className="flex justify-between items-baseline group"
    >
      <span className="eyebrow text-graphite/50">{label}</span>
      <span
        className={`text-graphite text-sm ${href ? "group-hover:text-brass transition-colors" : ""}`}
      >
        {value}
      </span>
    </Wrap>
  );
}
