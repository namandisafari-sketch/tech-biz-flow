import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt as ReceiptIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function POS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Fetch inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id)
        .gt("quantity", 0)
        .order("name");

      if (error) throw error;
      return data;
    },
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

  const addToCart = (item: any) => {
    const existingItem = cart.find((i) => i.id === item.id);
    if (existingItem) {
      if (existingItem.quantity >= item.quantity) {
        toast({
          title: "Out of stock",
          description: "Cannot add more items than available in stock.",
          variant: "destructive",
        });
        return;
      }
      setCart(
        cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: parseFloat(item.unit_price),
          quantity: 1,
          stock: item.quantity,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > item.stock) {
              toast({
                title: "Out of stock",
                description: "Cannot exceed available stock.",
                variant: "destructive",
              });
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create job record for the sale
      const jobRef = `SALE-${Date.now().toString().slice(-6)}`;
      
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert([
          {
            user_id: user.id,
            job_ref: jobRef,
            customer_id: selectedCustomer || null,
            device_type: "Parts Sale",
            device_model: "",
            fault_description: "Point of Sale Transaction",
            status: "completed",
            priority: "normal",
            total_amount: total,
            amount_paid: total,
            balance_due: 0,
          },
        ])
        .select()
        .single();

      if (jobError) throw jobError;

      // Create job items
      const jobItems = cart.map((item) => ({
        job_id: job.id,
        description: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("job_items")
        .insert(jobItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
      const { error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            user_id: user.id,
            job_id: job.id,
            receipt_no: receiptNo,
            payment_method: paymentMethod,
            amount: total,
          },
        ]);

      if (paymentError) throw paymentError;

      // Update inventory quantities
      for (const item of cart) {
        const { error: invError } = await supabase
          .from("inventory")
          .update({ quantity: item.stock - item.quantity })
          .eq("id", item.id);

        if (invError) throw invError;
      }

      return receiptNo;
    },
    onSuccess: (receiptNo) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setCart([]);
      setSelectedCustomer("");
      toast({
        title: "Sale completed",
        description: `Receipt ${receiptNo} generated successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete sale. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredInventory = inventory.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground mt-1">
            Quick checkout for parts and accessories
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredInventory.map((item: any) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Stock: {item.quantity}
                    </p>
                    <p className="text-lg font-bold">
                      UGX {parseFloat(item.unit_price).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer (Optional)</Label>
                  <Select
                    value={selectedCustomer}
                    onValueChange={setSelectedCustomer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Walk-in customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Cart is empty
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            UGX {item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>UGX {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (18%)</span>
                        <span>UGX {tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>UGX {total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mobile_money">
                            Mobile Money
                          </SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={() => checkoutMutation.mutate()}
                      disabled={checkoutMutation.isPending}
                    >
                      <ReceiptIcon className="h-4 w-4" />
                      {checkoutMutation.isPending
                        ? "Processing..."
                        : "Complete Sale"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
