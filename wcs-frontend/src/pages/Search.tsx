import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import HtmlToggleView from "@/components/HtmlToggleView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Loader2, Globe, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  text: string;
  html_pretty: string;
  summary: string;
  score: number;
  accuracy: number;
  metadata?: {
    url?: string;
    chunk_index?: number;
  };
}

export default function Search() {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url || !query) {
      toast({
        title: "Missing Information",
        description: "Please provide both URL and search query.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
      const res = await axios.post(
        `${apiBase}/api/search/`,
        { url, query },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 90000
        }
      );
      setResults(res.data.results || []);
      toast({
        title: "Search Complete",
        description: `Found ${res.data.results?.length || 0} relevant results.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Search Failed",
        description: err?.response?.data?.detail || err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">
            Search Website Content
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter a URL and your search query to find the most relevant content chunks.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Search Parameters</CardTitle>
              <CardDescription>
                Provide a website URL and describe what you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Globe className="inline h-4 w-4 mr-1" />
                    Website URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <SearchIcon className="inline h-4 w-4 mr-1" />
                    Search Query
                  </label>
                  <Input
                    type="text"
                    placeholder="What are you looking for?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="mr-2 h-5 w-5" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">
                Search Results ({results.length})
              </h2>
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            Result #{index + 1}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-primary">
                              Accuracy: {result.accuracy.toFixed(2)}%
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      {result.summary && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">Summary</h4>
                          <p className="text-sm text-muted-foreground">{result.summary}</p>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="max-h-80 overflow-y-auto border-t pt-4 scroll-smooth">
                      <div className="pr-2">
                        <HtmlToggleView html={result.html_pretty} text={result.text} />
                      </div>
                    </CardContent>

                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              No results yet. Enter a URL and query to start searching.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
