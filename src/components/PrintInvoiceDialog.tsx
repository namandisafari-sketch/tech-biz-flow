import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InvoicePrint } from "./InvoicePrint";
import { usePrint } from "@/hooks/usePrint";
import { Printer, Share2 } from "lucide-react";
import { toast } from "sonner";

interface PrintInvoiceDialogProps {
  invoiceData: any;
  trigger?: React.ReactNode;
}

export default function PrintInvoiceDialog({ invoiceData, trigger }: PrintInvoiceDialogProps) {
  const { componentRef, handlePrint } = usePrint();

  const handleWhatsAppShare = () => {
    const message = `Hello ${invoiceData.customer_name},\n\nYour invoice is ready!\n\nInvoice #: ${invoiceData.invoice_number}\nDevice: ${invoiceData.device_type} ${invoiceData.device_model}\nTotal: UGX ${invoiceData.total_due.toLocaleString()}\nPaid: UGX ${invoiceData.amount_paid.toLocaleString()}\nBalance: UGX ${invoiceData.balance_due.toLocaleString()}\n\nThank you for your business!\n${invoiceData.shop_name}`;
    
    const phoneNumber = invoiceData.customer_phone?.replace(/\D/g, '') || '';
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div ref={componentRef}>
            <InvoicePrint data={invoiceData} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1 gap-2">
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
            <Button onClick={handleWhatsAppShare} variant="outline" className="flex-1 gap-2">
              <Share2 className="h-4 w-4" />
              Send via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
