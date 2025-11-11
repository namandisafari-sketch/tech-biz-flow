import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReceiptPrint } from "./ReceiptPrint";
import { usePrint } from "@/hooks/usePrint";
import { Printer, Share2 } from "lucide-react";
import { toast } from "sonner";

interface PrintReceiptDialogProps {
  receiptData: any;
  trigger?: React.ReactNode;
}

export default function PrintReceiptDialog({ receiptData, trigger }: PrintReceiptDialogProps) {
  const { componentRef, handlePrint } = usePrint();

  const handleWhatsAppShare = () => {
    const message = `Hello ${receiptData.customer_name},\n\nPayment receipt for your service:\n\nReceipt #: ${receiptData.receipt_no}\nDevice: ${receiptData.device_type} ${receiptData.device_model}\nAmount Paid: UGX ${receiptData.amount.toLocaleString()}\nPayment Method: ${receiptData.payment_method}\n\nThank you!\n${receiptData.shop_name}`;
    
    const phoneNumber = receiptData.customer_phone?.replace(/\D/g, '') || '';
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
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div ref={componentRef}>
            <ReceiptPrint data={receiptData} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1 gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
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
