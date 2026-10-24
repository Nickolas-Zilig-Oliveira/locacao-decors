import { renderToStream } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/data/admin";
import { getQuoteById } from "@/lib/data/quotes";
import { ContractDocument } from "@/lib/pdf/contract-document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const quote = await getQuoteById(tenant.id, id);
  if (!quote) {
    return new NextResponse("Contrato não encontrado", { status: 404 });
  }

  const stream = await renderToStream(
    <ContractDocument tenant={tenant} quote={quote} />
  );

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${quote.number}.pdf"`,
    },
  });
}
