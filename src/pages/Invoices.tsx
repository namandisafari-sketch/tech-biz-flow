import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, Printer } from "lucide-react";
import { format } from "date-fns";
import PrintInvoiceDialog from "@/components/PrintInvoiceDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch jobs with customer and items data
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          customers (name, phone, email, address),
          job_items (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
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

  const getInvoiceData = (job: any) => {
    const customer = job.customers;
    const items = job.job_items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);
    const taxPercent = settings?.tax_percent || 0;
    const taxAmount = (subtotal * taxPercent) / 100;
    const totalDue = subtotal + taxAmount;

    return {
      invoice_number: job.job_ref,
      issue_date: new Date(job.created_at),
      due_date: job.due_date ? new Date(job.due_date) : undefined,
      customer_name: customer?.name || "Unknown",
      customer_phone: customer?.phone,
      customer_email: customer?.email,
      customer_address: customer?.address,
      device_type: job.device_type,
      device_model: job.device_model,
      fault_description: job.fault_description,
      job_ref: job.job_ref,
      amount_paid: parseFloat(job.amount_paid) || 0,
      balance_due: parseFloat(job.balance_due) || 0,
      items: items.map((item: any) => ({
        description: item.description,
        part_serial_number: item.part_serial_number,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total: parseFloat(item.total),
      })),
      subtotal,
      tax_amount: taxAmount,
      tax_percent: taxPercent,
      total_due: totalDue,
      shop_name: settings?.shop_name || "Tech Biz Track",
      shop_phone: settings?.shop_phone,
      shop_email: settings?.shop_email,
      shop_address: settings?.shop_address,
      payment_details: settings?.payment_details,
    };
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch =
      job.job_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.device_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales History</h1>
            <p className="text-muted-foreground mt-1">
              View all completed sales and invoices
            </p>
          </div>
          <Button size="lg" className="gap-2" variant="outline">
            <Printer className="h-4 w-4" />
            Batch Print
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job ref, customer, or device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="diagnosing">Diagnosing</SelectItem>
                  <SelectItem value="repairing">Repairing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading invoices...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Ref</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job: any) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono font-medium">
                        {job.job_ref}
                      </TableCell>
                      <TableCell>{job.customers?.name || "-"}</TableCell>
                      <TableCell>
                        {job.device_type} {job.device_model}
                      </TableCell>
                      <TableCell>
                        {format(new Date(job.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        UGX {parseFloat(job.total_amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        UGX {parseFloat(job.amount_paid || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        UGX {parseFloat(job.balance_due || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <PrintInvoiceDialog
                          invoiceData={getInvoiceData(job)}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
