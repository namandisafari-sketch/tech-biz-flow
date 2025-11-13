import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Plus, Trash2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePrint } from "@/hooks/usePrint";
import { BarcodePrintQueue } from "@/components/BarcodePrintQueue";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QueueItem {
  barcode: string;
  name: string;
  price: string;
}

export default function BarcodeGenerator() {
  const [barcodeValue, setBarcodeValue] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [printQueue, setPrintQueue] = useState<QueueItem[]>([]);
  const { toast } = useToast();
  const { componentRef, handlePrint } = usePrint();

  // Fetch inventory items
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const generateBarcode = () => {
    if (!barcodeValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a value to generate barcode",
        variant: "destructive",
      });
      return;
    }

    // Using a simple barcode generator service
    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
      barcodeValue
    )}&scale=3&includetext`;
    setGeneratedBarcode(barcodeUrl);
  };

  const addToQueue = () => {
    if (!barcodeValue.trim() || !itemName.trim() || !itemPrice.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields to add to print queue",
        variant: "destructive",
      });
      return;
    }

    setPrintQueue([
      ...printQueue,
      {
        barcode: barcodeValue,
        name: itemName,
        price: `UGX ${parseFloat(itemPrice).toLocaleString()}`,
      },
    ]);

    // Reset form
    setBarcodeValue("");
    setItemName("");
    setItemPrice("");
    setGeneratedBarcode("");

    toast({
      title: "Added to queue",
      description: "Label added to print queue successfully",
    });
  };

  const removeFromQueue = (index: number) => {
    setPrintQueue(printQueue.filter((_, i) => i !== index));
  };

  const addInventoryItemToQueue = (item: any) => {
    if (!item.barcode) {
      toast({
        title: "Error",
        description: "This item doesn't have a barcode assigned",
        variant: "destructive",
      });
      return;
    }

    setPrintQueue([
      ...printQueue,
      {
        barcode: item.barcode,
        name: item.name,
        price: `UGX ${parseFloat(item.unit_price).toLocaleString()}`,
      },
    ]);

    toast({
      title: "Added to queue",
      description: `${item.name} added to print queue`,
    });
  };

  const printLabels = () => {
    if (printQueue.length === 0) {
      toast({
        title: "Error",
        description: "Print queue is empty",
        variant: "destructive",
      });
      return;
    }

    handlePrint();
  };

  const downloadBarcode = () => {
    if (!generatedBarcode) {
      toast({
        title: "Error",
        description: "Please generate a barcode first",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = generatedBarcode;
    link.download = `barcode-${barcodeValue}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Barcode downloaded successfully",
    });
  };

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Barcode Generator</h1>
            <p className="text-muted-foreground mt-1">
              Generate and print barcode labels for inventory
            </p>
          </div>
          <Button
            onClick={printLabels}
            size="lg"
            className="gap-2"
            disabled={printQueue.length === 0}
          >
            <Printer className="h-4 w-4" />
            Print {printQueue.length} Labels
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Manual Barcode Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Create Label</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode-value">Barcode Value</Label>
                <Input
                  id="barcode-value"
                  placeholder="Enter barcode number"
                  value={barcodeValue}
                  onChange={(e) => setBarcodeValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-name">Product Name</Label>
                <Input
                  id="item-name"
                  placeholder="Enter product name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">Price (UGX)</Label>
                <Input
                  id="item-price"
                  type="number"
                  placeholder="Enter price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={generateBarcode} variant="outline" className="flex-1">
                  Preview
                </Button>
                <Button onClick={addToQueue} className="flex-1 gap-2">
                  <Plus className="h-4 w-4" />
                  Add to Queue
                </Button>
              </div>

              {generatedBarcode && (
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <img
                    src={generatedBarcode}
                    alt="Generated Barcode"
                    className="max-w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <Card>
            <CardHeader>
              <CardTitle>From Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {inventory.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.barcode || "No barcode"}
                      </p>
                      <p className="text-xs font-semibold">
                        UGX {parseFloat(item.unit_price).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addInventoryItemToQueue(item)}
                      disabled={!item.barcode}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Print Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Print Queue
                <Badge variant="secondary">{printQueue.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {printQueue.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No labels in queue
                  </p>
                ) : (
                  printQueue.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.barcode}</p>
                        <p className="text-xs font-semibold">{item.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromQueue(index)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Each A4 page prints 24 labels (6 rows × 4 columns)</p>
            <p>• Dashed lines show where to cut each label</p>
            <p>• Label size: 52.5mm × 49.5mm (standard adhesive label)</p>
            <p>• Add barcode to inventory items first for quick printing</p>
            <p>• Use Avery 5160 or equivalent label sheets</p>
          </CardContent>
        </Card>

        {/* Hidden print component */}
        <div className="hidden">
          <BarcodePrintQueue ref={componentRef} labels={printQueue} />
        </div>
      </div>
    </Layout>
  );
}
