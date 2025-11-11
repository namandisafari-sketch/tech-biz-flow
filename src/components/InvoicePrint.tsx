import { forwardRef } from "react";
import { format } from "date-fns";

interface InvoiceItem {
  description: string;
  part_serial_number?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  invoice_number: string;
  issue_date: Date;
  due_date?: Date;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  device_type: string;
  device_model?: string;
  fault_description?: string;
  job_ref: string;
  amount_paid: number;
  balance_due: number;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  tax_percent: number;
  total_due: number;
  notes?: string;
  shop_name: string;
  shop_phone?: string;
  shop_email?: string;
  shop_address?: string;
  payment_details?: string;
}

interface InvoicePrintProps {
  data: InvoiceData;
}

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-gray-900 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tech Biz Track</h1>
          <h2 className="text-2xl font-semibold">Invoice #{data.invoice_number}</h2>
          <p className="text-sm text-gray-600 mt-1">Technician Shop Management • Invoice</p>
        </div>

        {/* Dates */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <span className="font-semibold">Issued: </span>
            {format(data.issue_date, "PPP")}
          </div>
          {data.due_date && (
            <div>
              <span className="font-semibold">Due: </span>
              {format(data.due_date, "PPP")}
            </div>
          )}
        </div>

        {/* Bill To / From */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-2">BILL TO</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{data.customer_name}</p>
              {(data.customer_phone || data.customer_email) && (
                <p>
                  {data.customer_phone}
                  {data.customer_phone && data.customer_email && " • "}
                  {data.customer_email}
                </p>
              )}
              {data.customer_address && <p>{data.customer_address}</p>}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">FROM</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold">Tech Biz Track — {data.shop_name}</p>
              {(data.shop_phone || data.shop_email) && (
                <p>
                  {data.shop_phone}
                  {data.shop_phone && data.shop_email && " • "}
                  {data.shop_email}
                </p>
              )}
              {data.shop_address && <p>{data.shop_address}</p>}
            </div>
          </div>
        </div>

        {/* Device & Payment Info */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div>
            <h4 className="font-bold mb-2">Device</h4>
            <p>
              {data.device_type}
              {data.device_model && ` — ${data.device_model}`}
            </p>
            {data.fault_description && <p>Fault: {data.fault_description}</p>}
            <p>Job Ref: {data.job_ref}</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Payment</h4>
            <p>Amount Paid: UGX {data.amount_paid.toLocaleString()}</p>
            <p>Balance: UGX {data.balance_due.toLocaleString()}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-2 font-bold">ITEM / SERVICE</th>
              <th className="text-center py-2 font-bold">QTY</th>
              <th className="text-right py-2 font-bold">UNIT</th>
              <th className="text-right py-2 font-bold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="py-3">
                  <div>
                    {index + 1}. {item.description}
                  </div>
                  {item.part_serial_number && (
                    <div className="text-xs text-gray-600">
                      Part SN: {item.part_serial_number}
                    </div>
                  )}
                </td>
                <td className="text-center py-3">{item.quantity}</td>
                <td className="text-right py-3">
                  UGX {item.unit_price.toLocaleString()}
                </td>
                <td className="text-right py-3">
                  UGX {item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>UGX {data.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({data.tax_percent}%)</span>
              <span>UGX {data.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t-2 border-gray-900 pt-2">
              <span>TOTAL</span>
              <span>UGX {data.total_due.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {data.payment_details && (
          <div className="mb-4 text-sm">
            <p className="font-semibold">Make payment to:</p>
            <p className="whitespace-pre-line">{data.payment_details}</p>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="mb-6 text-sm">
            <p className="font-semibold">Notes:</p>
            <p>{data.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          <p>
            Thank you for choosing Tech Biz Track. For queries contact{" "}
            {data.shop_phone || data.shop_email}
          </p>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";
