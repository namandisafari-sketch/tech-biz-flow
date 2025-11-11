import { forwardRef } from "react";
import { format } from "date-fns";

interface ReceiptData {
  receipt_no: string;
  customer_name: string;
  customer_phone?: string;
  payment_date: Date;
  payment_method?: string;
  job_ref: string;
  amount: number;
  subtotal: number;
  tax: number;
  payment_reference?: string;
  served_by?: string;
  shop_name: string;
  shop_phone?: string;
}

interface ReceiptPrintProps {
  data: ReceiptData;
}

export const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-gray-900 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Tech Biz Track</h1>
          <h2 className="text-xl font-semibold">Receipt — {data.receipt_no}</h2>
        </div>

        {/* Customer Info */}
        <div className="mb-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Received from:</span>
            <span>{data.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Date:</span>
            <span>{format(data.payment_date, "PPP")}</span>
          </div>
          {data.customer_phone && (
            <div className="flex justify-between">
              <span className="font-semibold">Phone:</span>
              <span>{data.customer_phone}</span>
            </div>
          )}
          {data.payment_method && (
            <div className="flex justify-between">
              <span className="font-semibold">Mode:</span>
              <span>{data.payment_method}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-semibold">Job Ref:</span>
            <span>{data.job_ref}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center mb-6 py-4 bg-gray-100 rounded">
          <p className="text-3xl font-bold">UGX {data.amount.toLocaleString()}</p>
        </div>

        {/* Breakdown */}
        <div className="mb-6 space-y-2 text-sm border-y border-gray-300 py-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>UGX {data.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>UGX {data.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Paid</span>
            <span>UGX {data.amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Reference */}
        {data.payment_reference && (
          <div className="mb-4 text-sm text-center">
            <p className="font-semibold">QR Payment reference:</p>
            <p className="font-mono">{data.payment_reference}</p>
          </div>
        )}

        {/* Served By */}
        {data.served_by && (
          <div className="mb-6 text-sm text-center">
            <p>
              <span className="font-semibold">Served by:</span> {data.served_by}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          <p className="mb-2">
            Thank you for your payment. Keep this receipt for warranty/collection.
          </p>
          <p className="font-semibold">
            {data.shop_name}
            {data.shop_phone && ` • ${data.shop_phone}`}
          </p>
        </div>
      </div>
    );
  }
);

ReceiptPrint.displayName = "ReceiptPrint";
