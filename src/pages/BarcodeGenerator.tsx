import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BarcodeGenerator() {
  const [barcodeValue, setBarcodeValue] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const { toast } = useToast();

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
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Barcode Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate barcodes for products and inventory
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate Barcode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode-value">Barcode Value</Label>
                <Input
                  id="barcode-value"
                  placeholder="Enter product code, SKU, or any value"
                  value={barcodeValue}
                  onChange={(e) => setBarcodeValue(e.target.value)}
                />
              </div>

              <Button onClick={generateBarcode} className="w-full">
                Generate Barcode
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedBarcode ? (
                <>
                  <div className="flex justify-center items-center p-4 bg-background border rounded-lg">
                    <img
                      src={generatedBarcode}
                      alt="Generated Barcode"
                      className="max-w-full"
                    />
                  </div>
                  <Button
                    onClick={downloadBarcode}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Barcode
                  </Button>
                </>
              ) : (
                <div className="flex justify-center items-center h-48 text-muted-foreground border rounded-lg">
                  Enter a value and click generate to see your barcode
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Use product SKUs or unique identifiers for inventory tracking</p>
            <p>• Barcodes can include letters, numbers, and some special characters</p>
            <p>• Print barcodes on adhesive labels for easy application</p>
            <p>• Keep a record of barcode-to-product mappings in your inventory</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
