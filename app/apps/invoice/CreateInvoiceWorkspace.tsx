"use client";

import Image from "next/image";
import { toDataURL } from "qrcode";
import { useEffect, useMemo, useState } from "react";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: string;
};

const SUPPLIER = {
  name: "Maxim Nesazal",
  street: "Strakonická 1353/3",
  city: "15000 Praha",
  country: "Česká republika",
  ico: "09060910",
  dic: "",
  legalNote: "Fyzická osoba zapsaná v živnostenském rejstříku",
  bankAccount: "123-3491780227/0100",
  issuedBy: "Maxim Nesazal",
  phone: "+420771152300",
  email: "maxnesazal1492@gmail.com",
};

const CUSTOMER = {
  name: "Deep Systems s.r.o.",
  street: "Pod kopcem 562/5",
  city: "14700 Praha",
  country: "Česká republika",
  ico: "05109103",
  dic: "CZ05109103",
};

const FIXED_UNIT = "hod.";
const FIXED_UNIT_PRICE = 500;

const CZK_FORMATTER = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toNumber(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  const value = new Date(year, month - 1, day);
  value.setDate(value.getDate() + days);
  return toIsoDate(value);
}

function getLastDayOfPreviousMonth() {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 0));
}

function formatCzDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${Number(day)}.${Number(month)}.${year}`;
}

function generateInvoiceNumber() {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

function generateItemId() {
  return `item-${Math.random().toString(36).slice(2, 10)}`;
}

function toSpaydMessage(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, 60);
}

function mod97(value: string) {
  let checksum = 0;
  for (const char of value) {
    checksum = (checksum * 10 + Number(char)) % 97;
  }
  return checksum;
}

function czechAccountToIban(account: string) {
  const [accountPart, bankCodeRaw] = account.split("/");
  if (!accountPart || !bankCodeRaw) {
    return null;
  }

  const [prefixRaw, numberRaw] = accountPart.includes("-")
    ? accountPart.split("-")
    : ["0", accountPart];

  const prefix = prefixRaw || "0";
  const number = numberRaw || "";
  const bankCode = bankCodeRaw.trim();

  if (!/^\d+$/.test(prefix) || !/^\d+$/.test(number) || !/^\d+$/.test(bankCode)) {
    return null;
  }

  const bban = `${bankCode.padStart(4, "0")}${prefix.padStart(6, "0")}${number.padStart(10, "0")}`;
  const countryNumeric = "1235"; // C=12, Z=35
  const checkDigits = 98 - mod97(`${bban}${countryNumeric}00`);

  return `CZ${String(checkDigits).padStart(2, "0")}${bban}`;
}

export function CreateInvoiceWorkspace() {
  const today = useMemo(() => toIsoDate(new Date()), []);
  const supplierIban = useMemo(() => czechAccountToIban(SUPPLIER.bankAccount), []);

  const [invoiceNumber] = useState(() => generateInvoiceNumber());
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: generateItemId(),
      description: "Fixed - catalog",
      quantity: "70.8",
    },
  ]);
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(addDays(today, 14));
  const [taxableDate, setTaxableDate] = useState(getLastDayOfPreviousMonth());
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const itemRows = useMemo(
    () =>
      items.map((item) => {
        const quantityValue = toNumber(item.quantity);
        const rowTotal = quantityValue * FIXED_UNIT_PRICE;
        const quantityLabel = quantityValue.toLocaleString("cs-CZ", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });

        return {
          ...item,
          quantityValue,
          quantityLabel,
          rowTotal,
          rowTotalLabel: CZK_FORMATTER.format(rowTotal),
        };
      }),
    [items],
  );

  const total = useMemo(
    () => itemRows.reduce((sum, row) => sum + row.rowTotal, 0),
    [itemRows],
  );
  const variableSymbol = invoiceNumber;
  const unitPriceLabel = CZK_FORMATTER.format(FIXED_UNIT_PRICE);
  const totalLabel = CZK_FORMATTER.format(total);

  const qrPayload = useMemo(() => {
    if (!supplierIban) {
      return "";
    }

    const amount = total > 0 ? total.toFixed(2) : "0.00";
    const dueDateCompact = dueDate.replaceAll("-", "");
    const message = toSpaydMessage(`Faktura ${invoiceNumber}`);
    const fields = [
      `ACC:${supplierIban}`,
      `AM:${amount}`,
      "CC:CZK",
      `DT:${dueDateCompact}`,
      `X-VS:${variableSymbol}`,
      `MSG:${message}`,
    ];

    return `SPD*1.0*${fields.join("*")}*`;
  }, [dueDate, invoiceNumber, supplierIban, total, variableSymbol]);

  useEffect(() => {
    let mounted = true;

    toDataURL(qrPayload, {
      margin: 0,
      width: 220,
      errorCorrectionLevel: "M",
    })
      .then((value: string) => {
        if (mounted) {
          setQrCodeDataUrl(value);
        }
      })
      .catch(() => {
        if (mounted) {
          setQrCodeDataUrl("");
        }
      });

    return () => {
      mounted = false;
    };
  }, [qrPayload]);

  function downloadPdf() {
    window.print();
  }

  function updateIssueDate(nextValue: string) {
    setIssueDate(nextValue);
    setDueDate(addDays(nextValue, 14));
  }

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((previous) => [
      ...previous,
      {
        id: generateItemId(),
        description: "",
        quantity: "1",
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((previous) => {
      if (previous.length <= 1) {
        return previous;
      }
      return previous.filter((item) => item.id !== id);
    });
  }

  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.25fr]">
      <article className="rounded-2xl border border-(--line) bg-white p-6 print:hidden">
        <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Invoice values</h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Edit dates and invoice items. Supplier, customer, unit, and unit price are fixed.
        </p>

        <div className="mt-4 grid gap-3">
          <div className="rounded-lg border border-[#d8e2f4] bg-[#f8fbff] px-3 py-2 text-sm">
            <p className="text-xs font-semibold tracking-[0.1em] text-[#5f6f8f] uppercase">
              Invoice number
            </p>
            <p className="mt-1 font-semibold text-[#1a2b49]">{invoiceNumber}</p>
          </div>

          <div className="rounded-lg border border-[#d8e2f4] bg-[#f8fbff] px-3 py-2 text-sm">
            <p className="text-xs font-semibold tracking-[0.1em] text-[#5f6f8f] uppercase">
              Supplier and customer
            </p>
            <p className="mt-1 text-[#1a2b49]">
              Fixed: {SUPPLIER.name} → {CUSTOMER.name}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold tracking-[0.1em] text-[#5f6f8f] uppercase">
                Datum vystavení
              </span>
              <input
                type="date"
                value={issueDate}
                onChange={(event) => updateIssueDate(event.target.value)}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold tracking-[0.1em] text-[#5f6f8f] uppercase">
                Datum splatnosti
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold tracking-[0.1em] text-[#5f6f8f] uppercase">
                Datum zdanitelného plnění
              </span>
              <input
                type="date"
                value={taxableDate}
                onChange={(event) => setTaxableDate(event.target.value)}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="rounded-lg border border-[#d8e2f4] bg-[#f8fbff] px-3 py-2 text-sm">
            <p className="text-xs font-semibold tracking-[0.1em] text-[#5f6f8f] uppercase">
              Fixed billing
            </p>
            <p className="mt-1 text-[#1a2b49]">
              Jednotka: {FIXED_UNIT} • Cena položky: {unitPriceLabel}
            </p>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-lg border border-[#d8e2f4] p-3">
                <p className="text-xs font-semibold tracking-[0.1em] text-[#5f6f8f] uppercase">
                  Item {index + 1}
                </p>
                <div className="mt-2 grid gap-3 md:grid-cols-[1fr_130px_auto] md:items-end">
                  <label className="space-y-1">
                    <span className="text-xs text-[#5f6f8f]">Název položky a popis</span>
                    <input
                      value={item.description}
                      onChange={(event) => updateItem(item.id, { description: event.target.value })}
                      className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-[#5f6f8f]">Množství</span>
                    <input
                      value={item.quantity}
                      onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
                      className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="cursor-pointer rounded-lg border border-[#e5b9b1] bg-[#fff4f1] px-3 py-2 text-xs font-semibold text-[#99483a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#32548f] hover:bg-[#e5efff]"
            >
              Add item
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadPdf}
          className="mt-5 cursor-pointer rounded-xl border border-[#bcd0f2] bg-[#eef4ff] px-5 py-2 text-sm font-semibold text-[#32548f] hover:bg-[#e5efff]"
        >
          Download PDF
        </button>
      </article>

      <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 shadow-[0_20px_40px_-32px_rgba(19,33,58,0.55)] print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="border border-[#d5d9e2] text-[#2f3138]">
          <div className="grid border-b border-[#d5d9e2] md:grid-cols-2">
            <div className="space-y-1 border-b border-[#d5d9e2] p-4 text-xs md:border-r md:border-b-0">
              <p className="font-semibold tracking-[0.08em] text-[#61656f] uppercase">Dodavatel:</p>
              <p className="font-semibold">{SUPPLIER.name}</p>
              <p>{SUPPLIER.street}</p>
              <p>{SUPPLIER.city}</p>
              <p>{SUPPLIER.country}</p>
              <p className="pt-3">IČ: {SUPPLIER.ico}</p>
              <p>DIČ: {SUPPLIER.dic || "-"}</p>
            </div>

            <div className="space-y-2 p-4 text-xs">
              <p className="text-3xl leading-none font-semibold tracking-tight text-[#2a2d34]">
                Faktura {invoiceNumber}
              </p>
              <div className="border-t border-dashed border-[#cdd2dd] pt-3">
                <p className="font-semibold tracking-[0.08em] text-[#61656f] uppercase">Odběratel:</p>
                <p className="mt-1 font-semibold">{CUSTOMER.name}</p>
                <p>{CUSTOMER.street}</p>
                <p>{CUSTOMER.city}</p>
                <p>{CUSTOMER.country}</p>
              </div>
            </div>
          </div>

          <div className="grid border-b border-[#d5d9e2] md:grid-cols-2">
            <div className="border-b border-[#d5d9e2] p-4 text-xs md:border-r md:border-b-0">
              <p>{SUPPLIER.legalNote}</p>
              <p className="mt-7">Komerční banka, a.s.: {SUPPLIER.bankAccount}</p>
            </div>
            <div className="grid gap-2 p-4 text-xs sm:grid-cols-2">
              <p>IČ: {CUSTOMER.ico}</p>
              <p>Datum vystavení: {formatCzDate(issueDate)}</p>
              <p>DIČ: {CUSTOMER.dic}</p>
              <p>Zdanitelné plnění: {formatCzDate(taxableDate)}</p>
              <p />
              <p>Datum splatnosti: {formatCzDate(dueDate)}</p>
            </div>
          </div>

          <div className="p-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#d5d9e2] text-[#555a64]">
                  <th className="py-2 font-semibold">Název položky a popis</th>
                  <th className="py-2 text-right font-semibold">Množství</th>
                  <th className="py-2 text-right font-semibold">Jednotka</th>
                  <th className="py-2 text-right font-semibold">Cena položky</th>
                  <th className="py-2 text-right font-semibold">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {itemRows.map((item) => (
                  <tr key={item.id} className="border-b border-[#d5d9e2]">
                    <td className="py-2">{item.description || "-"}</td>
                    <td className="py-2 text-right">{item.quantityLabel}</td>
                    <td className="py-2 text-right">{FIXED_UNIT}</td>
                    <td className="py-2 text-right">{unitPriceLabel}</td>
                    <td className="py-2 text-right">{item.rowTotalLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#d5d9e2] px-4 py-3 text-right">
            <p className="text-lg font-semibold text-[#2a2d34]">Celkem: {totalLabel}</p>
          </div>

          <div className="grid gap-3 border-t border-[#d5d9e2] p-4 md:grid-cols-[140px_1fr]">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden border border-[#6b6f79] bg-white">
              {qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  alt="QR Platba"
                  width={112}
                  height={112}
                  unoptimized
                />
              ) : (
                <p className="text-center text-xs text-[#5a5f69]">
                  QR
                  <br />
                  Platba
                </p>
              )}
            </div>

            <div className="grid gap-2 text-xs sm:grid-cols-4">
              <div className="rounded border border-[#d7deeb] bg-[#f2f6ff] p-2">
                <p className="text-[#63718b]">Číslo účtu</p>
                <p className="font-semibold">{SUPPLIER.bankAccount}</p>
              </div>
              <div className="rounded border border-[#d7deeb] bg-[#f2f6ff] p-2">
                <p className="text-[#63718b]">Variabilní symbol</p>
                <p className="font-semibold">{variableSymbol}</p>
              </div>
              <div className="rounded border border-[#d7deeb] bg-[#f2f6ff] p-2">
                <p className="text-[#63718b]">Datum splatnosti</p>
                <p className="font-semibold">{formatCzDate(dueDate)}</p>
              </div>
              <div className="rounded border border-[#d7deeb] bg-[#f2f6ff] p-2">
                <p className="text-[#63718b]">Částka k uhrazení</p>
                <p className="font-semibold">{totalLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 border-t border-[#d5d9e2] p-4 text-xs sm:grid-cols-3 sm:items-center">
            <p>Vystavil: {SUPPLIER.issuedBy}</p>
            <p>{SUPPLIER.phone}</p>
            <p>{SUPPLIER.email}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
