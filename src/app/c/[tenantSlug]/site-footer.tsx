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
  const muted = dark ? "text-white/40" : "text-neutral-500";
  const link = dark ? "text-white/70 hover:text-white" : "text-neutral-600 hover:text-neutral-900";
  const border = dark ? "border-white/10" : "border-neutral-200";

  return (
    <footer className={`border-t px-4 py-6 text-center transition-colors duration-500 ${border}`}>
      {ig && (
        <a
          href={ig}
          target="_blank"
          rel="noreferrer"
          className={`mb-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-500 ${link}`}
        >
          <InstagramIcon className="h-4 w-4" />
          Instagram
        </a>
      )}
      <p className={`text-xs transition-colors duration-500 ${muted}`}>
        © {new Date().getFullYear()} {tenantName}. Todos os direitos reservados.
      </p>
      <p className={`mt-1 text-xs transition-colors duration-500 ${muted}`}>
        Site por <span className="font-semibold">Ziligz</span>
      </p>
    </footer>
  );
}
