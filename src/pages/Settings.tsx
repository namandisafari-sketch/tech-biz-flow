import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    shop_name: "",
    shop_phone: "",
    shop_email: "",
    shop_address: "",
    tax_percent: 0,
    payment_details: "",
  });

  // Fetch business settings
  const { data: settings, isLoading } = useQuery({
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
      
      if (data) {
        setFormData({
          shop_name: data.shop_name || "",
          shop_phone: data.shop_phone || "",
          shop_email: data.shop_email || "",
          shop_address: data.shop_address || "",
          tax_percent: Number(data.tax_percent) || 0,
          payment_details: data.payment_details || "",
        });
      }
      
      return data;
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        ...formData,
      };

      if (settings) {
        const { error } = await supabase
          .from("business_settings")
          .update(payload)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("business_settings")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business_settings"] });
      toast({
        title: "Settings saved",
        description: "Your business settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business information and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              This information will appear on your invoices and receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shop_name">Shop Name *</Label>
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_name: e.target.value })
                    }
                    required
                    placeholder="Tech Biz Track"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop_phone">Phone Number</Label>
                  <Input
                    id="shop_phone"
                    value={formData.shop_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_phone: e.target.value })
                    }
                    placeholder="+256 700 000 000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop_email">Email Address</Label>
                  <Input
                    id="shop_email"
                    type="email"
                    value={formData.shop_email}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_email: e.target.value })
                    }
                    placeholder="shop@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_percent">Tax Percentage (%)</Label>
                  <Input
                    id="tax_percent"
                    type="number"
                    step="0.01"
                    value={formData.tax_percent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tax_percent: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="18"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop_address">Business Address</Label>
                <Textarea
                  id="shop_address"
                  value={formData.shop_address}
                  onChange={(e) =>
                    setFormData({ ...formData, shop_address: e.target.value })
                  }
                  placeholder="123 Main Street, Kampala, Uganda"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_details">Payment Details</Label>
                <Textarea
                  id="payment_details"
                  value={formData.payment_details}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_details: e.target.value,
                    })
                  }
                  placeholder="Bank: Example Bank, Account: 1234567890, Mobile Money: +256700000000"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={saveMutation.isPending || isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
