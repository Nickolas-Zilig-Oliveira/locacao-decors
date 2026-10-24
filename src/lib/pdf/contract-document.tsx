import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Quote, Tenant } from "@/lib/types";
import { DEFAULT_CONTRACT_CLAUSES, quoteTotals } from "@/lib/contract-terms";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
  tenantName: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  muted: { color: "#555", marginBottom: 1 },
  hr: { borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 10 },
  title: { fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  col: { flex: 1 },
  label: { fontSize: 9, color: "#555" },
  value: { fontSize: 10, marginBottom: 4 },
  sectionTitle: { fontSize: 9, color: "#555", marginBottom: 6, marginTop: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    paddingBottom: 4,
    marginBottom: 4,
  },
  itemBlock: { marginBottom: 6 },
  tableRow: { flexDirection: "row", paddingVertical: 2 },
  thQty: { width: 40, fontWeight: 700 },
  thName: { flex: 1, fontWeight: 700 },
  thPrice: { width: 70, fontWeight: 700, textAlign: "right" },
  thTotal: { width: 70, fontWeight: 700, textAlign: "right" },
  tdQty: { width: 40 },
  tdName: { flex: 1 },
  tdPrice: { width: 70, textAlign: "right" },
  tdTotal: { width: 70, textAlign: "right" },
  componentRow: { flexDirection: "row", paddingLeft: 40, paddingVertical: 1 },
  componentText: { fontSize: 8.5, color: "#666" },
  totalsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#999",
    marginTop: 8,
    paddingTop: 8,
  },
  totalsCol: { alignItems: "center" },
  totalsLabel: { fontSize: 9, color: "#555" },
  totalsValue: { fontSize: 10, fontWeight: 700, marginTop: 2 },
  clausesTitle: { fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 20, marginBottom: 10 },
  clause: { fontSize: 9, marginBottom: 4, lineHeight: 1.4 },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#999",
    width: 280,
    marginTop: 80,
    paddingTop: 6,
    textAlign: "center",
  },
});

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

export function ContractDocument({ tenant, quote }: { tenant: Tenant; quote: Quote }) {
  const { subtotal, total, toReceive } = quoteTotals(quote.items, quote.discount, quote.paid_amount);
  const issueDate = new Date(quote.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.tenantName}>{tenant.name}</Text>
        {tenant.cnpj && <Text style={styles.muted}>CNPJ: {tenant.cnpj}</Text>}
        <Text style={styles.muted}>
          {[tenant.phone, tenant.email].filter(Boolean).join(" - ")}
        </Text>
        {tenant.address && <Text style={styles.muted}>{tenant.address}</Text>}

        <View style={styles.hr} />
        <Text style={styles.title}>Contrato de Locação # {quote.number}</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{quote.customer_name}</Text>
            {quote.customer_phone && (
              <>
                <Text style={styles.label}>Telefone</Text>
                <Text style={styles.value}>{quote.customer_phone}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Início da Locação</Text>
            <Text style={styles.value}>{formatDateTime(quote.rental_start)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Término da Locação</Text>
            <Text style={styles.value}>{formatDateTime(quote.rental_end)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Tema</Text>
            <Text style={styles.value}>{quote.theme ?? "—"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ITENS DE LOCAÇÃO</Text>
        {quote.items_note && <Text style={styles.value}>{quote.items_note}</Text>}

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
                <Text style={styles.componentText}>
                  • {c.quantity}x {c.name}
                </Text>
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
          <View style={styles.totalsCol}>
            <Text style={styles.totalsLabel}>Valor a receber</Text>
            <Text style={styles.totalsValue}>{money(toReceive)}</Text>
          </View>
        </View>

        <Text style={styles.clausesTitle}>Cláusulas Contratuais</Text>
        {DEFAULT_CONTRACT_CLAUSES.map((clause, i) => (
          <Text key={i} style={styles.clause}>
            1.{i + 1} {clause}
          </Text>
        ))}

        {(quote.notes || tenant.pickup_notes) && (
          <Text style={styles.clause}>
            Observação: {quote.notes ?? tenant.pickup_notes}
          </Text>
        )}

        <Text style={{ ...styles.value, marginTop: 16 }}>
          {tenant.city ?? ""}, {issueDate}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.signatureLine}>
          <Text>{quote.customer_name}</Text>
          <Text style={styles.muted}>CPF: {quote.customer_cpf ?? ""}</Text>
        </View>
      </Page>
    </Document>
  );
}
