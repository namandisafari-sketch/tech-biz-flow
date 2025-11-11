import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Save } from "lucide-react";

export default function NewJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    customer_id: "",
    device_type: "",
    device_model: "",
    device_imei: "",
    device_serial_number: "",
    device_state_before: "",
    fault_description: "",
    status: "received",
    priority: "normal",
    total_amount: 0,
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customer_type: "retail" as "retail" | "wholesale",
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("customers")
        .insert([{ ...newCustomer, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setFormData({ ...formData, customer_id: data.id });
      setNewCustomer({ name: "", phone: "", email: "", address: "", customer_type: "retail" });
      toast({
        title: "Customer created",
        description: "New customer has been added successfully.",
      });
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const jobRef = `JOB-${Date.now().toString().slice(-6)}`;
      
      // Get customer type
      const customer = customers.find((c: any) => c.id === formData.customer_id);
      const customerType = customer?.customer_type || "retail";
      
      const { data, error } = await supabase
        .from("jobs")
        .insert([
          {
            ...formData,
            job_ref: jobRef,
            user_id: user.id,
            customer_type: customerType,
            balance_due: formData.total_amount,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Job created",
        description: "New job has been created successfully.",
      });
      navigate("/jobs");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) {
      toast({
        title: "Customer required",
        description: "Please select or create a customer.",
        variant: "destructive",
      });
      return;
    }
    createJobMutation.mutate();
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Job</h1>
          <p className="text-muted-foreground mt-1">
            Enter job details and customer information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Existing Customer</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customer_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Or Create New Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phone: e.target.value })
                      }
                      placeholder="+256 700 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, email: e.target.value })
                      }
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: e.target.value,
                        })
                      }
                      placeholder="Customer address"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => createCustomerMutation.mutate()}
                  disabled={
                    !newCustomer.name || createCustomerMutation.isPending
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Device Details */}
          <Card>
            <CardHeader>
              <CardTitle>Device Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="device_type">Device Type *</Label>
                  <Input
                    id="device_type"
                    value={formData.device_type}
                    onChange={(e) =>
                      setFormData({ ...formData, device_type: e.target.value })
                    }
                    required
                    placeholder="iPhone, MacBook, Samsung, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device_model">Device Model</Label>
                  <Input
                    id="device_model"
                    value={formData.device_model}
                    onChange={(e) =>
                      setFormData({ ...formData, device_model: e.target.value })
                    }
                    placeholder="13 Pro, Air M2, S23, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device_imei">IMEI Number</Label>
                  <Input
                    id="device_imei"
                    value={formData.device_imei}
                    onChange={(e) =>
                      setFormData({ ...formData, device_imei: e.target.value })
                    }
                    placeholder="123456789012345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device_serial_number">Serial Number</Label>
                  <Input
                    id="device_serial_number"
                    value={formData.device_serial_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        device_serial_number: e.target.value,
                      })
                    }
                    placeholder="ABC123XYZ456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="device_state_before">
                  Device State Before Repair
                </Label>
                <Textarea
                  id="device_state_before"
                  value={formData.device_state_before}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      device_state_before: e.target.value,
                    })
                  }
                  placeholder="e.g., Screen cracked, battery drains fast, water damaged"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fault_description">Fault Description *</Label>
                <Textarea
                  id="fault_description"
                  value={formData.fault_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fault_description: e.target.value,
                    })
                  }
                  required
                  placeholder="Describe the issue in detail"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="diagnosing">Diagnosing</SelectItem>
                      <SelectItem value="repairing">Repairing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Estimated Amount (UGX)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/jobs")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJobMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {createJobMutation.isPending ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
