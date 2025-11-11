import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoicePrint } from "./InvoicePrint";
import { usePrint } from "@/hooks/usePrint";
import { FileText, Printer } from "lucide-react";

interface PrintInvoiceDialogProps {
  invoiceData: any;
  trigger?: React.ReactNode;
}

export default function PrintInvoiceDialog({
  invoiceData,
  trigger,
}: PrintInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const { componentRef, handlePrint } = usePrint();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Print Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            Review and print the invoice
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <InvoicePrint ref={componentRef} data={invoiceData} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
