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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import PrintReceiptDialog from "./PrintReceiptDialog";

interface PaymentDialogProps {
  job: any;
  trigger?: React.ReactNode;
}

export default function PaymentDialog({ job, trigger }: PaymentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: job.balance_due || 0,
    payment_method: "cash",
    payment_reference: "",
    served_by: "",
  });

  // Fetch business settings
  const { data: settings } = useQuery({
    queryKey: ["business_settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
      const amount = parseFloat(formData.amount.toString());
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            user_id: user.id,
            job_id: job.id,
            receipt_no: receiptNo,
            payment_method: formData.payment_method,
            amount,
            payment_reference: formData.payment_reference,
            served_by: formData.served_by,
          },
        ]);

      if (paymentError) throw paymentError;

      // Update job balance
      const newAmountPaid = parseFloat(job.amount_paid || 0) + amount;
      const newBalance = parseFloat(job.total_amount || 0) - newAmountPaid;

      const { error: jobError } = await supabase
        .from("jobs")
        .update({
          amount_paid: newAmountPaid,
          balance_due: newBalance,
        })
        .eq("id", job.id);

      if (jobError) throw jobError;

      // Get customer info
      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("id", job.customer_id)
        .single();

      const taxPercent = settings?.tax_percent || 0;
      const subtotal = amount / (1 + taxPercent / 100);
      const tax = amount - subtotal;

      return {
        receipt_no: receiptNo,
        customer_name: customer?.name || "Unknown",
        customer_phone: customer?.phone,
        payment_date: new Date(),
        payment_method: formData.payment_method,
        job_ref: job.job_ref,
        amount,
        subtotal,
        tax,
        payment_reference: formData.payment_reference,
        served_by: formData.served_by,
        shop_name: settings?.shop_name || "Tech Biz Track",
        shop_phone: settings?.shop_phone,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setReceiptData(data);
      setOpen(false);
      setShowReceipt(true);
      toast({
        title: "Payment recorded",
        description: "Payment has been processed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(formData.amount.toString()) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }
    paymentMutation.mutate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Record Payment
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Process payment for {job.job_ref}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (UGX) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Balance due: UGX {parseFloat(job.balance_due || 0).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_reference">Payment Reference</Label>
              <Input
                id="payment_reference"
                value={formData.payment_reference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_reference: e.target.value,
                  })
                }
                placeholder="Transaction ID, reference number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="served_by">Served By</Label>
              <Input
                id="served_by"
                value={formData.served_by}
                onChange={(e) =>
                  setFormData({ ...formData, served_by: e.target.value })
                }
                placeholder="Staff name"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending
                  ? "Processing..."
                  : "Process Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {receiptData && (
        <PrintReceiptDialog
          receiptData={receiptData}
          trigger={
            <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
              <DialogTrigger asChild>
                <div />
              </DialogTrigger>
            </Dialog>
          }
        />
      )}
    </>
  );
}
