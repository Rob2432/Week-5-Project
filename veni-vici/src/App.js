import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [cat, setCat] = useState(null);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function isBanned(catData) {
    if (!catData || !catData.breeds || catData.breeds.length === 0) return false;
    const breed = catData.breeds[0];

    return banList.some((ban) => {
      const attributeValue = breed[ban.type];
      if (!attributeValue) return false;

      if (ban.type === "temperament") {
        return attributeValue
          .toLowerCase()
          .split(",")
          .map((t) => t.trim())
          .includes(ban.value.toLowerCase());
      }
      return attributeValue.toLowerCase() === ban.value.toLowerCase();
    });
  }

  async function fetchCat() {
    setLoading(true);
    setError(null);

    try {
      let tries = 0;
      let newCat = null;

      while (!newCat && tries < 10) {
        const res = await fetch(
          "https://api.thecatapi.com/v1/images/search?limit=1&has_breeds=1"
        );
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
        const candidate = data[0];
        if (!isBanned(candidate)) {
          newCat = candidate;
        }
        tries++;
      }

      if (!newCat) {
        setError("No more cats available due to your ban list 😿");
      }

      setCat(newCat);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch cat data. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function addBan(type, value) {
    const alreadyBanned = banList.some(
      (ban) => ban.type === type && ban.value === value
    );
    if (!alreadyBanned) {
      setBanList([...banList, { type, value }]);
    }
  }

  function removeBan(index) {
    const updated = [...banList];
    updated.splice(index, 1);
    setBanList(updated);
  }

  function clearBans() {
    setBanList([]);
  }

  return (
    <div
      className="app-container"
      style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}
    >
      <h1 style={{ textAlign: "center" }}>🐱 Discover Random Cats</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        Click “Discover” to see a random cat. Click an attribute to ban it.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <button onClick={fetchCat} disabled={loading}>
          {loading ? "Loading..." : "Discover"}
        </button>
        <button onClick={clearBans}>Clear Ban List</button>
      </div>

      <div className="ban-buttons">
        <button onClick={() => addBan("breed", "Persian")}>
          Ban Persian Breed
        </button>
        <button onClick={() => addBan("origin", "Japan")}>
          Ban Cats from Japan
        </button>
        <button onClick={() => addBan("temperament", "Playful")}>
          Ban Playful Cats
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>🚫 Ban List</h3>
        {banList.length === 0 ? (
          <p style={{ color: "#777" }}>No bans yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {banList.map((ban, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: "#eee",
                  borderRadius: 15,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
                onClick={() => removeBan(i)}
                title="Click to remove from ban list"
              >
                {ban.type}: {ban.value} ✕
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          textAlign: "center",
        }}
      >
        {!cat ? (
          <p style={{ color: "#777" }}>Click “Discover” to see a cat!</p>
        ) : (
          <>
            <img
              src={cat.url}
              alt="Cat"
              style={{
                maxWidth: "100%",
                borderRadius: 12,
                marginBottom: 10,
                objectFit: "cover",
              }}
            />

            {cat.breeds && cat.breeds.length > 0 && (
              <div>
                <h2>{cat.breeds[0].name}</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span
                    onClick={() => addBan("breed", cat.breeds[0].name)}
                    style={{ cursor: "pointer", color: "#0070f3" }}
                  >
                    <strong>Breed:</strong> {cat.breeds[0].name}
                  </span>

                  <span
                    onClick={() => addBan("origin", cat.breeds[0].origin)}
                    style={{ cursor: "pointer", color: "#0070f3" }}
                  >
                    <strong>Origin:</strong> {cat.breeds[0].origin}
                  </span>

                  <span>
                    <strong>Life Span:</strong> {cat.breeds[0].life_span} years
                  </span>

                  <div style={{ marginTop: 10 }}>
                    <strong>Temperaments:</strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 6,
                      }}
                    >
                      {cat.breeds[0].temperament &&
                        cat.breeds[0].temperament.split(",").map((temp, i) => (
                          <span
                            key={i}
                            onClick={() => addBan("temperament", temp.trim())}
                            style={{
                              backgroundColor: "#f5f5f5",
                              borderRadius: 10,
                              padding: "4px 8px",
                              cursor: "pointer",
                            }}
                          >
                            {temp.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
