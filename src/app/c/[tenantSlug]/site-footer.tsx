import { instagramLink } from "@/lib/instagram";
import { InstagramIcon } from "./icons";

export function SiteFooter({
  tenantName,
  instagram,
  dark = true,
}: {
  tenantName: string;
  instagram: string | null;
  dark?: boolean;
}) {
  const ig = instagramLink(instagram);
  const muted = dark ? "text-white/40" : "text-neutral-400";
  const link = dark
    ? "bg-white/[0.07] text-white/80 hover:bg-white/[0.12] hover:text-white"
    : "bg-neutral-900/[0.05] text-neutral-700 hover:bg-neutral-900/[0.09] hover:text-neutral-900";
  const border = dark ? "border-white/[0.08]" : "border-neutral-900/[0.07]";

  return (
    <footer
      className={`border-t px-4 pt-8 text-center transition-colors duration-500 ${border}`}
      style={{ paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom) + 1.5rem))" }}
    >
      {ig && (
        <a
          href={ig}
          target="_blank"
          rel="noreferrer"
          className={`mb-5 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${link}`}
        >
          <InstagramIcon className="h-4 w-4" />
          Siga no Instagram
        </a>
      )}
      <p className={`text-xs transition-colors duration-500 ${muted}`}>
        © {new Date().getFullYear()} {tenantName}
      </p>
      <p className={`mt-1 text-xs transition-colors duration-500 ${muted}`}>
        Feito com <span className="font-semibold">Ziligz</span>
      </p>
    </footer>
  );
}
