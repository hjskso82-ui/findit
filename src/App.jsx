import { useState } from "react";

// Free limits per type
const FREE_LIMITS = { song: 1, video: 5, account: 3 };
const TYPE_KEYS = ["song", "video", "account"];
const NEON = { song: "#B026FF", video: "#00F5FF", account: "#FF2D78" };
const NEON_GLOW = {
  song: "0 0 24px #B026FF88, 0 0 48px #B026FF33",
  video: "0 0 24px #00F5FF88, 0 0 48px #00F5FF33",
  account: "0 0 24px #FF2D7888, 0 0 48px #FF2D7833",
};

const PACK_PRICE = { song: "$0.99", video: "$2.99", account: "$1.99" };
const PACK_AMOUNT = { song: "5 arama", video: "3 arama", account: "5 arama" };
const PACK_PRICE_EN = { song: "$0.99", video: "$2.99", account: "$1.99" };
const PACK_AMOUNT_EN = { song: "5 searches", video: "3 searches", account: "5 searches" };

function getUsage() {
  try {
    const raw = localStorage.getItem("findit_v2");
    if (!raw) return { song: 0, video: 0, account: 0, month: "" };
    const data = JSON.parse(raw);
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (data.month !== currentMonth) return { song: 0, video: 0, account: 0, month: currentMonth };
    return data;
  } catch { return { song: 0, video: 0, account: 0, month: "" }; }
}

function saveUsage(usage) {
  try {
    localStorage.setItem("findit_v2", JSON.stringify({
      ...usage,
      month: new Date().toISOString().slice(0, 7),
    }));
  } catch { }
}

function PaywallModal({ lang, neon, glow, typeKey, onClose }) {
  const [selected, setSelected] = useState("sub");
  const isTR = lang === "TR";

  const packLabel = isTR
    ? `${PACK_AMOUNT[typeKey]} Paketi`
    : `${PACK_AMOUNT_EN[typeKey]} Pack`;
  const packPrice = isTR ? PACK_PRICE[typeKey] : PACK_PRICE_EN[typeKey];
  const packDesc = isTR ? "Tek seferlik, sınırsız geçerlilik" : "One-time, never expires";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(8,8,16,0.93)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#0F0F1A", border: `1.5px solid ${neon}55`,
        borderRadius: 24, padding: "36px 32px", maxWidth: 400, width: "100%",
        boxShadow: glow,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#F0F0FF" }}>
            {isTR ? "Ücretsiz hakkın bitti" : "No free searches left"}
          </h2>
          <p style={{ margin: 0, color: "#8888AA", fontSize: 14 }}>
            {isTR ? "Aramaya devam etmek için bir plan seç:" : "Choose a plan to keep going:"}
          </p>
        </div>

        {/* Pack */}
        <div onClick={() => setSelected("pack")} style={{
          border: `2px solid ${selected === "pack" ? neon : "#FFFFFF15"}`,
          borderRadius: 14, padding: "16px 20px", marginBottom: 12,
          cursor: "pointer", background: selected === "pack" ? `${neon}11` : "transparent",
          transition: "all 0.2s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#F0F0FF" }}>{packLabel}</div>
              <div style={{ fontSize: 13, color: "#8888AA", marginTop: 3 }}>{packDesc}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 22, color: selected === "pack" ? neon : "#F0F0FF" }}>
              {packPrice}
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div onClick={() => setSelected("sub")} style={{
          border: `2px solid ${selected === "sub" ? neon : "#FFFFFF15"}`,
          borderRadius: 14, padding: "16px 20px", marginBottom: 24,
          cursor: "pointer", background: selected === "sub" ? `${neon}11` : "transparent",
          transition: "all 0.2s", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -11, right: 16,
            background: neon, color: "#080810",
            fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 100,
          }}>
            {isTR ? "EN POPÜLER" : "MOST POPULAR"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#F0F0FF" }}>
                {isTR ? "Sınırsız Plan" : "Unlimited Plan"}
              </div>
              <div style={{ fontSize: 13, color: "#8888AA", marginTop: 3 }}>
                {isTR ? "Sınırsız arama, istediğinde iptal" : "Unlimited searches, cancel anytime"}
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 22, color: selected === "sub" ? neon : "#F0F0FF" }}>
              $4.99<span style={{ fontSize: 13, fontWeight: 400, color: "#8888AA" }}>{isTR ? "/ay" : "/mo"}</span>
            </div>
          </div>
        </div>

        <button style={{
          width: "100%", padding: "15px", borderRadius: 12, border: "none",
          background: neon, color: "#080810", fontWeight: 800, fontSize: 16,
          cursor: "pointer", boxShadow: glow, marginBottom: 10,
          letterSpacing: 0.3,
        }}>
          {isTR ? "Ödemeye Geç →" : "Continue to Payment →"}
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "#FFFFFF33", margin: "0 0 10px" }}>
          {isTR ? "Güvenli ödeme · Stripe ile" : "Secure payment · Powered by Stripe"}
        </p>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", borderRadius: 12,
          border: "1px solid #FFFFFF15", background: "transparent",
          color: "#8888AA", fontSize: 14, cursor: "pointer",
        }}>
          {isTR ? "Şimdi değil" : "Maybe later"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("TR");
  const [typeIdx, setTypeIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(() => getUsage());
  const [showPaywall, setShowPaywall] = useState(false);

  const isTR = lang === "TR";
  const typeKey = TYPE_KEYS[typeIdx];
  const neon = NEON[typeKey];
  const glow = NEON_GLOW[typeKey];
  const freeLimit = FREE_LIMITS[typeKey];
  const usedCount = usage[typeKey] || 0;
  const remaining = Math.max(0, freeLimit - usedCount);

  const PLACEHOLDERS = {
    TR: {
      song: "Örn: 2016'da çıkmış, kadın sesli, yavaş tempolu, nakaratta 'gel' diye tekrar ediyor...",
      video: "Örn: Çocuğun köpeğiyle oynaması, sarı kapüşonlu, arka planda kar var...",
      account: "Örn: Saçları kırmızı, tatil videoları çeken, komik editler yapan TikTokçu...",
    },
    EN: {
      song: "E.g. A slow 2016 song, female voice, chorus repeating 'come back'...",
      video: "E.g. Kid playing with a dog, yellow hoodie, snow in the background...",
      account: "E.g. Red-haired girl, travel videos, funny edits on TikTok...",
    },
  };

  const TYPE_LABELS = {
    TR: ["Şarkı", "Video", "Hesap"],
    EN: ["Song", "Video", "Account"],
  };

  async function handleFind() {
    if (!query.trim() || loading) return;
    if (remaining <= 0) { setShowPaywall(true); return; }

    setLoading(true);
    setResults(null);
    setError("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `You help people find ${typeKey}s from vague descriptions by searching the web.
Search thoroughly, then respond ONLY with this JSON (no markdown, no extra text):
{
  "matches": [
    {
      "title": "exact name",
      "artist_or_creator": "name",
      "year": "year or empty",
      "why": "why this matches in 1 sentence",
      "direct_link": "DIRECT link — for songs: Spotify or YouTube watch URL; for videos: YouTube watch URL; for accounts: channel/profile URL. NEVER search result URLs.",
      "platform": "Spotify / YouTube / TikTok / Instagram / etc"
    }
  ],
  "tips": "one helpful tip to narrow it down"
}
Give 3-5 matches. Respond in ${isTR ? "Turkish" : "English"}.`,
          messages: [{ role: "user", content: `Find this ${typeKey}: "${query}"` }],
        }),
      });

      const data = await res.json();
      const textBlocks = (data.content || []).filter(b => b.type === "text");
      const text = textBlocks[textBlocks.length - 1]?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("no json");
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.matches?.length) throw new Error("empty");

      setResults(parsed);

      // Save usage
      const newUsage = { ...usage, [typeKey]: usedCount + 1 };
      setUsage(newUsage);
      saveUsage(newUsage);

    } catch {
      setError(isTR
        ? "Sonuç alınamadı. Açıklamayı biraz değiştirip tekrar dene."
        : "Couldn't get results. Try rephrasing your description.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#F0F0FF", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {showPaywall && (
        <PaywallModal
          lang={lang} neon={neon} glow={glow} typeKey={typeKey}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse at 20% 20%, ${neon}18 0%, transparent 60%),
                     radial-gradient(ellipse at 80% 80%, ${neon}10 0%, transparent 55%)`,
        transition: "background 0.5s",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: neon, textShadow: glow, transition: "all 0.4s", letterSpacing: -0.5 }}>
            ◈ FindIt
          </div>
          <button onClick={() => setLang(l => l === "TR" ? "EN" : "TR")} style={{
            background: "transparent", border: `1.5px solid ${neon}55`,
            color: neon, borderRadius: 8, padding: "6px 16px",
            cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 1,
          }}>
            {lang === "TR" ? "EN" : "TR"}
          </button>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "48px 0 36px" }}>
          <h1 style={{
            fontSize: "clamp(26px,5.5vw,50px)", fontWeight: 900,
            lineHeight: 1.1, margin: "0 0 14px",
            background: `linear-gradient(135deg, #ffffff 40%, ${neon})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {isTR ? "Aklındaki Her Şeyi Bul" : "Find Anything You Remember"}
          </h1>
          <p style={{ color: "#8888AA", fontSize: 15, margin: 0, lineHeight: 1.7 }}>
            {isTR
              ? "Adını unuttuğun şarkıyı, videoyu ya da hesabı tarif et — AI internette arasın."
              : "Describe the song, video, or account you can't name — AI searches the web for you."}
          </p>
        </div>

        {/* Type tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {TYPE_LABELS[lang].map((label, i) => {
            const tk = TYPE_KEYS[i];
            const lim = FREE_LIMITS[tk];
            const u = usage[tk] || 0;
            const rem = Math.max(0, lim - u);
            return (
              <button key={i} onClick={() => { setTypeIdx(i); setResults(null); setQuery(""); setError(""); }} style={{
                padding: "10px 22px", borderRadius: 100, cursor: "pointer",
                fontWeight: 600, fontSize: 14, transition: "all 0.25s",
                border: `2px solid ${i === typeIdx ? NEON[tk] : "#FFFFFF15"}`,
                background: i === typeIdx ? `${NEON[tk]}22` : "transparent",
                color: i === typeIdx ? NEON[tk] : "#8888AA",
                boxShadow: i === typeIdx ? NEON_GLOW[tk] : "none",
              }}>
                {label}
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 700,
                  color: rem === 0 ? "#FF2D78" : i === typeIdx ? NEON[tk] : "#8888AA66",
                }}>
                  {rem}/{lim}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search box */}
        <div style={{
          background: "#0F0F1A", border: `1.5px solid ${neon}33`,
          borderRadius: 16, padding: 4, marginBottom: 10,
          boxShadow: `0 0 40px ${neon}0D`, transition: "border-color 0.4s",
        }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFind(); } }}
            placeholder={PLACEHOLDERS[lang][typeKey]}
            rows={4}
            style={{
              width: "100%", background: "transparent", border: "none",
              color: "#F0F0FF", fontSize: 15, lineHeight: 1.7,
              padding: "16px 20px", resize: "none", outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          <div style={{ padding: "0 12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#FFFFFF33" }}>
              {isTR ? "Ne kadar detay verirsen o kadar iyi" : "More detail = better results"}
            </span>
            <button onClick={handleFind} disabled={loading || !query.trim()} style={{
              padding: "11px 30px", borderRadius: 10, cursor: (!loading && query.trim()) ? "pointer" : "not-allowed",
              fontWeight: 700, fontSize: 15, border: "none",
              background: (!loading && query.trim()) ? neon : "#FFFFFF11",
              color: (!loading && query.trim()) ? "#080810" : "#8888AA",
              boxShadow: (!loading && query.trim()) ? glow : "none",
              transition: "all 0.3s",
            }}>
              {loading ? (isTR ? "Aranıyor..." : "Searching...") : (isTR ? "Bul" : "Find It")}
            </button>
          </div>
        </div>

        {/* Free counter */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6 }}>
            {[...Array(freeLimit)].map((_, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%",
                background: i < usedCount ? "#FFFFFF15" : neon,
                boxShadow: i < usedCount ? "none" : glow,
                transition: "all 0.4s",
              }} />
            ))}
          </div>
          {remaining > 0 ? (
            <span style={{ fontSize: 13, color: "#8888AA" }}>
              {isTR ? `${remaining} ücretsiz hakkın kaldı` : `${remaining} free search${remaining !== 1 ? "es" : ""} left`}
            </span>
          ) : (
            <span
              onClick={() => setShowPaywall(true)}
              style={{ fontSize: 13, color: "#FF2D78", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              {isTR ? "Ücretsiz hakkın bitti — Plan seç" : "No free searches left — Choose a plan"}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 34, marginBottom: 10, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</div>
            <p style={{ color: "#8888AA", fontSize: 14, margin: 0 }}>
              {isTR ? "AI internette arıyor, biraz bekle..." : "AI is searching the web, please wait..."}
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            background: "#FF2D7815", border: "1px solid #FF2D7833",
            borderRadius: 12, padding: "14px 18px", marginBottom: 20,
            color: "#FF8888", fontSize: 14,
          }}>{error}</div>
        )}

        {/* Results */}
        {results && !loading && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: neon }}>
                {isTR ? "Sonuçlar" : "Results"}
              </h2>
              <button onClick={() => { setResults(null); setQuery(""); }} style={{
                background: "transparent", border: "1px solid #FFFFFF15",
                color: "#8888AA", borderRadius: 8, padding: "5px 14px",
                cursor: "pointer", fontSize: 13,
              }}>
                {isTR ? "Tekrar Dene" : "Try Again"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.matches?.map((m, i) => (
                <a key={i} href={m.direct_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#0F0F1A",
                    border: `1.5px solid ${i === 0 ? neon + "55" : "#FFFFFF0D"}`,
                    borderRadius: 14, padding: "16px 18px",
                    boxShadow: i === 0 ? `0 0 24px ${neon}18` : "none",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = neon + "88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = i === 0 ? neon + "55" : "#FFFFFF0D"; e.currentTarget.style.transform = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                          {i === 0 && (
                            <span style={{
                              background: neon, color: "#080810",
                              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100,
                            }}>#1</span>
                          )}
                          {m.platform && (
                            <span style={{
                              background: "#FFFFFF0D", color: "#8888AA",
                              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                            }}>{m.platform}</span>
                          )}
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#F0F0FF" }}>{m.title}</span>
                        </div>
                        {m.artist_or_creator && (
                          <div style={{ fontSize: 13, color: neon, fontWeight: 600, marginBottom: 4 }}>
                            {m.artist_or_creator}{m.year ? ` · ${m.year}` : ""}
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: "#8888AA", lineHeight: 1.5 }}>{m.why}</div>
                      </div>
                      <div style={{ color: neon, fontSize: 18, marginLeft: 12, marginTop: 2 }}>→</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {results.tips && (
              <div style={{
                marginTop: 14, background: `${neon}0D`, border: `1px solid ${neon}1A`,
                borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#8888AA", lineHeight: 1.6,
              }}>
                💡 {results.tips}
              </div>
            )}
            <p style={{ textAlign: "center", fontSize: 11, color: "#FFFFFF22", marginTop: 18 }}>
              {isTR ? "Sonuçlar web araması + AI analizi ile bulundu." : "Results found via web search + AI analysis."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}