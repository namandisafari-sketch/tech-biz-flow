import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customer_type: "retail" as "retail" | "wholesale",
  });

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create/Update customer mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingCustomer) {
        const { error } = await supabase
          .from("customers")
          .update(formData)
          .eq("id", editingCustomer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customers")
          .insert([{ ...formData, user_id: user.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: editingCustomer ? "Customer updated" : "Customer created",
        description: "Customer information has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Customer deleted",
        description: "Customer has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer. They may have associated jobs.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", address: "", customer_type: "retail" });
    setEditingCustomer(null);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      customer_type: (customer.customer_type as "retail" | "wholesale") || "retail",
    });
    setDialogOpen(true);
  };

  const filteredCustomers = customers.filter(
    (customer: any) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage your customer database
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? "Edit Customer" : "New Customer"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+256 700 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="customer@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Customer address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_type">Customer Type</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value: "retail" | "wholesale") =>
                      setFormData({ ...formData, customer_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No customers found. Create your first customer to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.customer_type === "wholesale" ? "default" : "secondary"}>
                          {customer.customer_type || "retail"}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{customer.address || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(customer.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
