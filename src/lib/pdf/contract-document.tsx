import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Quote, Tenant } from "@/lib/types";
import { DEFAULT_CONTRACT_CLAUSES, quoteTotals } from "@/lib/contract-terms";

function money(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${date} ${time} - ${weekday}`;
}

function hexToRgba(hex: string, alpha: number) {
  const clean = (hex || "#111111").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16) || 0x111111;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ContractDocument({ tenant, quote }: { tenant: Tenant; quote: Quote }) {
  const { subtotal, total, toReceive } = quoteTotals(quote.items, quote.discount, quote.paid_amount);
  const issueDate = new Date(quote.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const accent = tenant.primary_color || "#111111";
  const tint = hexToRgba(accent, 0.07);
  const tintStrong = hexToRgba(accent, 0.12);

  const styles = StyleSheet.create({
    page: { fontSize: 10, fontFamily: "Helvetica", color: "#1c1c1c" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: accent,
      paddingHorizontal: 32,
      paddingVertical: 20,
    },
    logo: { width: 38, height: 38, borderRadius: 8, marginRight: 12, objectFit: "cover" },
    logoFallback: {
      width: 38,
      height: 38,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: "rgba(255,255,255,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    logoFallbackText: { color: "#fff", fontSize: 16, fontWeight: 700 },
    tenantName: { fontSize: 15, fontWeight: 700, color: "#fff" },
    tenantMeta: { fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginTop: 2 },
    body: { paddingHorizontal: 32, paddingTop: 20, paddingBottom: 32 },
    titleWrap: { alignItems: "center", marginBottom: 16 },
    titleLabel: { fontSize: 8, letterSpacing: 2, color: "#999", marginBottom: 2 },
    titleValue: { fontSize: 16, fontWeight: 700, color: "#1c1c1c" },
    titleRule: { width: 48, height: 2, backgroundColor: accent, marginTop: 6, borderRadius: 1 },
    infoCard: {
      backgroundColor: tint,
      borderRadius: 8,
      padding: 12,
      marginBottom: 14,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    infoItem: { width: "33.33%", marginBottom: 6 },
    infoLabel: { fontSize: 7.5, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 },
    infoValue: { fontSize: 9.5, marginTop: 2, fontWeight: 700, color: "#1c1c1c" },
    sectionLabel: {
      fontSize: 8.5,
      fontWeight: 700,
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 4,
    },
    itemsNote: { fontSize: 9, color: "#555", marginBottom: 8 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tintStrong,
      borderRadius: 4,
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginBottom: 2,
    },
    itemBlock: { marginBottom: 4 },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    thQty: { width: 40, fontWeight: 700, fontSize: 8.5, color: "#555" },
    thName: { flex: 1, fontWeight: 700, fontSize: 8.5, color: "#555" },
    thPrice: { width: 70, fontWeight: 700, fontSize: 8.5, color: "#555", textAlign: "right" },
    thTotal: { width: 70, fontWeight: 700, fontSize: 8.5, color: "#555", textAlign: "right" },
    tdQty: { width: 40, fontWeight: 700 },
    tdName: { flex: 1, fontWeight: 700 },
    tdPrice: { width: 70, textAlign: "right" },
    tdTotal: { width: 70, textAlign: "right", fontWeight: 700 },
    componentRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 48,
      paddingRight: 8,
      paddingVertical: 3,
    },
    componentImg: { width: 16, height: 16, marginRight: 5, borderRadius: 3, objectFit: "cover" },
    componentBullet: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#bbb", marginRight: 6 },
    componentText: { fontSize: 8.5, color: "#666", flex: 1 },
    componentPrice: { fontSize: 8.5, color: "#666", width: 65, textAlign: "right" },
    componentReplacement: { fontSize: 8.5, color: "#999", width: 110, textAlign: "right" },
    totalsBox: {
      flexDirection: "row",
      backgroundColor: tint,
      borderRadius: 8,
      marginTop: 12,
      padding: 12,
    },
    totalsCol: { flex: 1, alignItems: "center" },
    totalsLabel: { fontSize: 8, color: "#777" },
    totalsValue: { fontSize: 11, fontWeight: 700, marginTop: 3, color: "#1c1c1c" },
    totalsColEmphasis: {
      flex: 1.2,
      alignItems: "center",
      borderLeftWidth: 1,
      borderLeftColor: hexToRgba(accent, 0.25),
      paddingLeft: 10,
    },
    totalsValueEmphasis: { fontSize: 13, fontWeight: 700, marginTop: 3, color: accent },
    clausesTitle: {
      fontSize: 11,
      fontWeight: 700,
      textAlign: "center",
      marginTop: 24,
      marginBottom: 10,
      color: "#1c1c1c",
    },
    clause: { fontSize: 8.5, marginBottom: 5, lineHeight: 1.45, color: "#333" },
    noteCard: {
      backgroundColor: tint,
      borderRadius: 8,
      padding: 10,
      marginTop: 10,
    },
    noteText: { fontSize: 8.5, color: "#444", lineHeight: 1.4 },
    signOff: { marginTop: 18, fontSize: 9.5, color: "#555" },
    footer: {
      position: "absolute",
      bottom: 16,
      left: 32,
      right: 32,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 7.5,
      color: "#bbb",
    },
    signPage: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
    signLogo: { width: 52, height: 52, borderRadius: 10, marginBottom: 10, objectFit: "cover" },
    signLogoFallback: {
      width: 52,
      height: 52,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: tintStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    signLogoFallbackText: { fontSize: 20, fontWeight: 700, color: accent },
    signTenant: { fontSize: 12, fontWeight: 700, color: "#1c1c1c", marginBottom: 28 },
    signatureLine: {
      borderTopWidth: 1,
      borderTopColor: "#999",
      width: 280,
      marginTop: 70,
      paddingTop: 6,
      textAlign: "center",
    },
    signatureName: { fontSize: 10, fontWeight: 700, color: "#1c1c1c" },
    signatureCpf: { fontSize: 9, color: "#777", marginTop: 2 },
  });

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const HeaderLogo = () =>
    tenant.logo_url ? (
      <Image style={styles.logo} src={tenant.logo_url} />
    ) : (
      <View style={styles.logoFallback}>
        <Text style={styles.logoFallbackText}>{tenant.name.charAt(0).toUpperCase()}</Text>
      </View>
    );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <HeaderLogo />
          <View>
            <Text style={styles.tenantName}>{tenant.name}</Text>
            <Text style={styles.tenantMeta}>
              {[tenant.cnpj && `CNPJ: ${tenant.cnpj}`, tenant.phone, tenant.email]
                .filter(Boolean)
                .join("  •  ")}
            </Text>
            {tenant.address && <Text style={styles.tenantMeta}>{tenant.address}</Text>}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleWrap}>
            <Text style={styles.titleLabel}>CONTRATO DE LOCAÇÃO</Text>
            <Text style={styles.titleValue}># {quote.number}</Text>
            <View style={styles.titleRule} />
          </View>

          <View style={styles.infoCard}>
            <InfoField label="Cliente" value={quote.customer_name} />
            {quote.customer_phone && <InfoField label="Telefone" value={quote.customer_phone} />}
            <InfoField label="Tema" value={quote.theme ?? "—"} />
            <InfoField label="Início da locação" value={formatDateTime(quote.rental_start)} />
            <InfoField label="Término da locação" value={formatDateTime(quote.rental_end)} />
          </View>

          <Text style={styles.sectionLabel}>Itens de locação</Text>
          {quote.items_note && <Text style={styles.itemsNote}>{quote.items_note}</Text>}

          <View style={styles.tableHeader}>
            <Text style={styles.thQty}>Qtdade</Text>
            <Text style={styles.thName}>Produto (Locação)</Text>
            <Text style={styles.thPrice}>Preço (un.)</Text>
            <Text style={styles.thTotal}>Total</Text>
          </View>
          {quote.items.map((item, i) => (
            <View key={i} style={styles.itemBlock}>
              <View style={styles.tableRow}>
                <Text style={styles.tdQty}>{item.quantity}x</Text>
                <Text style={styles.tdName}>{item.name}</Text>
                <Text style={styles.tdPrice}>{money(item.unit_price)}</Text>
                <Text style={styles.tdTotal}>{money(item.quantity * item.unit_price)}</Text>
              </View>
              {item.components?.map((c, ci) => (
                <View key={ci} style={styles.componentRow}>
                  {c.photo_url ? (
                    <Image style={styles.componentImg} src={c.photo_url} />
                  ) : (
                    <View style={styles.componentBullet} />
                  )}
                  <Text style={styles.componentText}>
                    {c.quantity}x {c.name}
                  </Text>
                  {c.unit_price != null && (
                    <Text style={styles.componentPrice}>{money(c.unit_price)}</Text>
                  )}
                  {c.replacement_value != null && (
                    <Text style={styles.componentReplacement}>
                      Reposição: {money(c.replacement_value)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          <View style={styles.totalsBox}>
            <View style={styles.totalsCol}>
              <Text style={styles.totalsLabel}>Sub Total</Text>
              <Text style={styles.totalsValue}>{money(subtotal)}</Text>
            </View>
            <View style={styles.totalsCol}>
              <Text style={styles.totalsLabel}>Desconto</Text>
              <Text style={styles.totalsValue}>{money(quote.discount)}</Text>
            </View>
            <View style={styles.totalsCol}>
              <Text style={styles.totalsLabel}>Valor total</Text>
              <Text style={styles.totalsValue}>{money(total)}</Text>
            </View>
            <View style={styles.totalsCol}>
              <Text style={styles.totalsLabel}>Valor pago</Text>
              <Text style={styles.totalsValue}>{money(quote.paid_amount)}</Text>
            </View>
            <View style={styles.totalsColEmphasis}>
              <Text style={styles.totalsLabel}>Valor a receber</Text>
              <Text style={styles.totalsValueEmphasis}>{money(toReceive)}</Text>
            </View>
          </View>

          <Text style={styles.clausesTitle}>Cláusulas Contratuais</Text>
          {DEFAULT_CONTRACT_CLAUSES.map((clause, i) => (
            <Text key={i} style={styles.clause}>
              1.{i + 1} {clause}
            </Text>
          ))}

          {(quote.notes || tenant.pickup_notes) && (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>Observação: {quote.notes ?? tenant.pickup_notes}</Text>
            </View>
          )}

          <Text style={styles.signOff}>
            {tenant.city ?? ""}, {issueDate}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Contrato gerado via Ziligz</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.signPage}>
          {tenant.logo_url ? (
            <Image style={styles.signLogo} src={tenant.logo_url} />
          ) : (
            <View style={styles.signLogoFallback}>
              <Text style={styles.signLogoFallbackText}>{tenant.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.signTenant}>{tenant.name}</Text>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureName}>{quote.customer_name}</Text>
            <Text style={styles.signatureCpf}>CPF: {quote.customer_cpf ?? "—"}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Contrato gerado via Ziligz</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
