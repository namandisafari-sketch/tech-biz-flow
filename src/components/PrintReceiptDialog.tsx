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
import { ReceiptPrint } from "./ReceiptPrint";
import { usePrint } from "@/hooks/usePrint";
import { Receipt, Printer } from "lucide-react";

interface PrintReceiptDialogProps {
  receiptData: any;
  trigger?: React.ReactNode;
}

export default function PrintReceiptDialog({
  receiptData,
  trigger,
}: PrintReceiptDialogProps) {
  const [open, setOpen] = useState(false);
  const { componentRef, handlePrint } = usePrint();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Receipt className="h-4 w-4" />
            Print Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>
            Review and print the receipt
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ReceiptPrint ref={componentRef} data={receiptData} />
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
