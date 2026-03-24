import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Zap, Clock, ShoppingCart, Search, Filter } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { SAMPLE_PRODUCTS, CATEGORIES } from "@/src/constants";
import { toast } from "sonner";

export default function InstantPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const selectedCategory = categoryParam;

  const setSelectedCategory = (cat: string | null) => {
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = SAMPLE_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return p.isInstantEligible && matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    toast.success("Item added to cart!");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Instant Delivery</h1>
            <p className="text-slate-500">Groceries at your doorstep in 10–30 mins</p>
          </div>
        </div>
        <Button onClick={() => navigate("/cart")} className="bg-slate-900 text-white gap-2">
          <ShoppingCart className="h-5 w-5" /> View Cart
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search for snacks, drinks, and more..." 
            className="pl-10 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Button 
            variant={selectedCategory === null ? "primary" : "outline"} 
            size="sm" 
            className="rounded-full whitespace-nowrap"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {CATEGORIES.map((cat) => (
            <Button 
              key={cat} 
              variant={selectedCategory === cat ? "primary" : "outline"} 
              size="sm" 
              className="rounded-full whitespace-nowrap"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <motion.div key={product.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="overflow-hidden h-full flex flex-col group cursor-pointer border-slate-200 hover:shadow-md transition-shadow">
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-yellow-500 text-white border-none flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {product.estimatedDeliveryTime}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{product.category}</p>
                  <p className="text-lg font-bold text-slate-900">₹{product.price}</p>
                </div>
                <Button 
                  className="w-full mt-4 bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => addToCart(product.id)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <p className="text-slate-500 text-lg">No products found matching your search.</p>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
