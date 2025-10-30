import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";


function HtmlToggleView({ html, text, darkMode }) {
  const [showHtml, setShowHtml] = useState(false);

  return (
    <div
      className={`mt-2 p-3 rounded-2xl transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"
        }`}
    >
      <button
        onClick={() => setShowHtml(!showHtml)}
        className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all ${darkMode
          ? "border-gray-700 text-gray-200 hover:bg-gray-800"
          : "border-gray-400 text-gray-700 hover:bg-gray-200"
          }`}
      >
        {showHtml ? "View Text" : "<> View HTML"}
      </button>

      <div className="mt-3">
        {showHtml ? (
          <SyntaxHighlighter
            language="html"
            style={darkMode ? dracula : oneLight}
            customStyle={{
              borderRadius: "0.75rem",
              backgroundColor: darkMode ? "#1e1e1e" : "#f5f5f5",
              padding: "1rem",
              fontSize: "0.9rem",
              color: darkMode ? "#f8f9fa" : "#212529",
              transition: "all 0.3s ease",
            }}
          >
            {html}
          </SyntaxHighlighter>
        ) : (
          <p
            className={`text-sm leading-relaxed ${darkMode ? "text-gray-200" : "text-gray-800"
              }`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}




export default function App() {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.className = newMode ? "dark-mode" : "light-mode";
  };


  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_BASE + "/api/search/",
        { url, query },
        { headers: { "Content-Type": "application/json" }, timeout: 90000 }
      );
      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err?.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img
              src="/ic2.png"
              alt="App Logo"
              className="me-2"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
            <span className="navbar-brand fw-bold mb-0 h4">
              Website Content Search
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
          >
            {darkMode ? "☀ Light" : "⊹ ࣪ ˖Dark"}
          </button>
        </div>
      </nav>


      {/* Main Content */}
      <div className="container py-5">
        <motion.form
          onSubmit={submit}
          className="card shadow-lg p-4 mb-5 border-0 search-card mx-auto"
          style={{ maxWidth: "650px" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Website URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              className="form-control glowing-input"
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Search Query</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              className="form-control glowing-input"
              placeholder="e.g. payment API"
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center ">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="btn btn-primary fw-semibold px-4"
              type="submit"
            >
              {loading ? "Searching..." : "Search"}
            </motion.button>
            <small className="abc form-label fst-italic fw-semibold" >Top 10 results returned</small>
          </div>
        </motion.form>

        {/* Results */}
        <div className="results-section mx-auto" style={{ maxWidth: "650px" }}>
          {results.length === 0 ? (
            <div className="abc  text-center fst-italic form-label fw-semibold " >
              No results yet. Try searching something.
            </div>
          ) : (
            <AnimatePresence>
              {results.map((r, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card mb-4 result-card border-0 shadow-sm"
                >
                  <div className="card-body">
                    <div className="text-secondary small mb-2">
                      Score: {r.score ? r.score.toFixed(4) : "N/A"} • chunk #{r.chunk_index}
                    </div>
                    <div className="fw-semibold mb-1">Summary:</div>
                    <p
                      className={`small mb-2 ${darkMode ? "text-light" : "text-dark"
                        }`}
                    >
                      {r.summary || r.text?.slice(0, 250) + "..."}
                    </p>


                    <div className="mb-2">
                      <div className="text-success small mb-2">
                        Accuracy: {r.accuracy ? `${r.accuracy}%` : "N/A"}
                      </div>

                      {/* Toggleable HTML content */}
                      <HtmlToggleView html={r.html_pretty} text={r.text || r.summary} darkMode={darkMode} />




                    </div>

                    <div className="text-primary small">{r.url}</div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
