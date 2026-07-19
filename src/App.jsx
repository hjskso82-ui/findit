import { useState, useEffect } from "react";

const FREE_LIMITS = { song: 1, video: 5, account: 3 };
const TYPE_KEYS = ["song", "video", "account"];
const NEON = { song: "#B026FF", video: "#00F5FF", account: "#FF2D78" };
const NEON_GLOW = {
  song: "0 0 24px #B026FF88, 0 0 48px #B026FF33",
  video: "0 0 24px #00F5FF88, 0 0 48px #00F5FF33",
  account: "0 0 24px #FF2D7888, 0 0 48px #FF2D7833",
};

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const CHECKOUT_URLS = {
  pack: "https://5306379145663.gumroad.com/l/ofdxzi?wanted=true",
  sub: "https://5306379145663.gumroad.com/l/wbwgj?wanted=true",
};

function isPremium() {
  try { return localStorage.getItem("findit_premium") === "true"; } catch { return false; }
}
function markPremium() {
  try { localStorage.setItem("findit_premium", "true"); } catch { }
}

const LANGS = {
  TR: { name: "Türkçe", label: "Türkçe" },
  EN: { name: "English", label: "English" },
  RU: { name: "Русский", label: "Русский" },
  AZ: { name: "Azərbaycan", label: "Azərbaycan" },
  AR: { name: "العربية", label: "العربية" },
  DE: { name: "Deutsch", label: "Deutsch" },
  FR: { name: "Français", label: "Français" },
  ES: { name: "Español", label: "Español" },
};

const TEXT = {
  TR: {
    title: "Aklındaki Her Şeyi Bul",
    subtitle: "Adını unuttuğun şarkıyı, videoyu ya da hesabı tarif et — AI internette arasın.",
    types: ["Şarkı", "Video", "Hesap"],
    find: "Bul", finding: "Aranıyor...",
    results: "Sonuçlar", tryAgain: "Tekrar Dene",
    freeLeft: (n) => `${n} ücretsiz aramanız kaldı`,
    noFree: "Ücretsiz hakkın bitti — Plan seç",
    hint: "Ne kadar çok detay verirsen o kadar iyi sonuç alırsın.",
    disclaimer: "Sonuçlar web araması + AI analizi ile bulundu.",
    searching: "AI internette arıyor, biraz bekle...",
    errMsg: "Sonuç alınamadı. Açıklamayı biraz değiştirip tekrar dene.",
    placeholder: {
      song: "Örn: 2016'da çıkmış, kadın sesli, yavaş tempolu, nakaratta 'gel' diye tekrar ediyor...",
      video: "Örn: Çocuğun köpeğiyle oynaması, sarı kapüşonlu, arka planda kar var...",
      account: "Örn: Saçları kırmızı, tatil videoları çeken, komik editler yapan TikTokçu...",
    },
    paywall: {
      title: "Ücretsiz hakkın bitti",
      subtitle: "Aramaya devam etmek için bir plan seç:",
      pack: "Arama Paketi", packDesc: "Tek seferlik, sınırsız geçerlilik",
      sub: "Sınırsız Plan", subDesc: "Sınırsız arama, istediğinde iptal",
      popular: "EN POPÜLER", cta: "Ödemeye Geç →",
      secure: "Güvenli ödeme · Lemon Squeezy ile", later: "Şimdi değil",
    },
  },
  EN: {
    title: "Find Anything You Remember",
    subtitle: "Describe the song, video, or account you can't name — AI searches the web for you.",
    types: ["Song", "Video", "Account"],
    find: "Find It", finding: "Searching...",
    results: "Results", tryAgain: "Try Again",
    freeLeft: (n) => `${n} free search${n !== 1 ? "es" : ""} left`,
    noFree: "No free searches left — Choose a plan",
    hint: "More detail = better results",
    disclaimer: "Results found via web search + AI analysis.",
    searching: "AI is searching the web, please wait...",
    errMsg: "Couldn't get results. Try rephrasing your description.",
    placeholder: {
      song: "E.g. A slow 2016 song, female voice, chorus repeating 'come back'...",
      video: "E.g. Kid playing with a dog, yellow hoodie, snow in the background...",
      account: "E.g. Red-haired girl, travel videos, funny edits on TikTok...",
    },
    paywall: {
      title: "No free searches left",
      subtitle: "Choose a plan to keep going:",
      pack: "Search Pack", packDesc: "One-time, never expires",
      sub: "Unlimited Plan", subDesc: "Unlimited searches, cancel anytime",
      popular: "MOST POPULAR", cta: "Continue to Payment →",
      secure: "Secure payment · Powered by Lemon Squeezy", later: "Maybe later",
    },
  },
  RU: {
    title: "Найди всё, что помнишь",
    subtitle: "Опиши песню, видео или аккаунт, название которых забыл — AI найдёт в интернете.",
    types: ["Песня", "Видео", "Аккаунт"],
    find: "Найти", finding: "Поиск...",
    results: "Результаты", tryAgain: "Попробовать снова",
    freeLeft: (n) => `Осталось бесплатных поисков: ${n}`,
    noFree: "Бесплатные попытки закончились — Выбрать план",
    hint: "Чем больше деталей, тем лучше результат.",
    disclaimer: "Результаты найдены через веб-поиск + анализ AI.",
    searching: "AI ищет в интернете, подожди немного...",
    errMsg: "Не удалось найти результат. Попробуй изменить описание.",
    placeholder: {
      song: "Напр.: медленная песня 2016 года, женский голос, в припеве повторяется 'вернись'...",
      video: "Напр.: ребёнок играет с собакой, жёлтая толстовка, снег на фоне...",
      account: "Напр.: рыжая девушка, тревел-видео, смешные монтажи в TikTok...",
    },
    paywall: {
      title: "Бесплатные попытки закончились",
      subtitle: "Выбери план, чтобы продолжить:",
      pack: "Пакет поисков", packDesc: "Разовая покупка, без срока действия",
      sub: "Безлимитный план", subDesc: "Неограниченный поиск, отмена в любое время",
      popular: "ПОПУЛЯРНОЕ", cta: "Перейти к оплате →",
      secure: "Безопасная оплата · Lemon Squeezy", later: "Не сейчас",
    },
  },
  AZ: {
    title: "Ağlındakı Hər Şeyi Tap",
    subtitle: "Adını unutduğun mahnını, videonu ya da hesabı təsvir et — AI internetdə axtarsın.",
    types: ["Mahnı", "Video", "Hesab"],
    find: "Tap", finding: "Axtarılır...",
    results: "Nəticələr", tryAgain: "Yenidən Cəhd Et",
    freeLeft: (n) => `${n} pulsuz axtarışın qaldı`,
    noFree: "Pulsuz hüququn bitdi — Plan seç",
    hint: "Nə qədər çox detal versən, o qədər yaxşı nəticə alarsan.",
    disclaimer: "Nəticələr veb axtarışı + AI analizi ilə tapıldı.",
    searching: "AI internetdə axtarır, bir az gözlə...",
    errMsg: "Nəticə tapılmadı. Təsviri bir az dəyişib yenidən cəhd et.",
    placeholder: {
      song: "Məs: 2016-da çıxmış, qadın səsli, yavaş templi, nəqəratda 'gəl' deyə təkrarlanır...",
      video: "Məs: uşağın iti ilə oynaması, sarı kapüşonlu, arxa planda qar var...",
      account: "Məs: saçları qırmızı, səyahət videoları çəkən, gülməli montajlar edən TikTokçu...",
    },
    paywall: {
      title: "Pulsuz hüququn bitdi",
      subtitle: "Axtarışa davam etmək üçün plan seç:",
      pack: "Axtarış Paketi", packDesc: "Tək dəfəlik, məhdudiyyətsiz müddət",
      sub: "Limitsiz Plan", subDesc: "Limitsiz axtarış, istənilən vaxt ləğv et",
      popular: "ƏN POPULYAR", cta: "Ödənişə Keç →",
      secure: "Təhlükəsiz ödəniş · Lemon Squeezy ilə", later: "İndi yox",
    },
  },
  AR: {
    title: "ابحث عن أي شيء تتذكره",
    subtitle: "صف الأغنية أو الفيديو أو الحساب الذي لا تتذكر اسمه — سيبحث الذكاء الاصطناعي على الويب.",
    types: ["أغنية", "فيديو", "حساب"],
    find: "ابحث", finding: "جارٍ البحث...",
    results: "النتائج", tryAgain: "حاول مرة أخرى",
    freeLeft: (n) => `تبقى لديك ${n} عمليات بحث مجانية`,
    noFree: "انتهت عمليات البحث المجانية — اختر خطة",
    hint: "كلما زادت التفاصيل، كانت النتائج أفضل.",
    disclaimer: "تم العثور على النتائج عبر البحث على الويب + تحليل الذكاء الاصطناعي.",
    searching: "الذكاء الاصطناعي يبحث على الويب، الرجاء الانتظار...",
    errMsg: "تعذر الحصول على نتائج. حاول إعادة صياغة الوصف.",
    placeholder: {
      song: "مثال: أغنية بطيئة من عام 2016، صوت أنثوي، اللازمة تتكرر بكلمة 'عد'...",
      video: "مثال: طفل يلعب مع كلبه، هوديي أصفر، ثلج في الخلفية...",
      account: "مثال: فتاة شعرها أحمر، تنشر فيديوهات سفر، مونتاج مضحك على تيك توك...",
    },
    paywall: {
      title: "انتهت عمليات البحث المجانية",
      subtitle: "اختر خطة للمتابعة:",
      pack: "باقة بحث", packDesc: "دفعة واحدة، بدون انتهاء صلاحية",
      sub: "خطة غير محدودة", subDesc: "بحث غير محدود، إلغاء في أي وقت",
      popular: "الأكثر شيوعاً", cta: "المتابعة للدفع →",
      secure: "دفع آمن · بواسطة Lemon Squeezy", later: "ليس الآن",
    },
  },
  DE: {
    title: "Finde alles, woran du dich erinnerst",
    subtitle: "Beschreibe den Song, das Video oder Konto, dessen Namen du vergessen hast — die KI durchsucht das Web.",
    types: ["Song", "Video", "Konto"],
    find: "Finden", finding: "Suche läuft...",
    results: "Ergebnisse", tryAgain: "Erneut versuchen",
    freeLeft: (n) => `${n} kostenlose Suchen übrig`,
    noFree: "Keine kostenlosen Suchen mehr — Plan wählen",
    hint: "Je mehr Details, desto besser die Ergebnisse.",
    disclaimer: "Ergebnisse durch Websuche + KI-Analyse gefunden.",
    searching: "KI durchsucht das Web, bitte warten...",
    errMsg: "Keine Ergebnisse gefunden. Versuche die Beschreibung anzupassen.",
    placeholder: {
      song: "Z.B.: langsamer Song von 2016, weibliche Stimme, Refrain wiederholt 'komm zurück'...",
      video: "Z.B.: Kind spielt mit Hund, gelber Hoodie, Schnee im Hintergrund...",
      account: "Z.B.: rothaariges Mädchen, Reisevideos, lustige Edits auf TikTok...",
    },
    paywall: {
      title: "Keine kostenlosen Suchen mehr",
      subtitle: "Wähle einen Plan, um fortzufahren:",
      pack: "Such-Paket", packDesc: "Einmalig, läuft nie ab",
      sub: "Unbegrenzter Plan", subDesc: "Unbegrenzte Suche, jederzeit kündbar",
      popular: "BELIEBTESTE", cta: "Weiter zur Zahlung →",
      secure: "Sichere Zahlung · Powered by Lemon Squeezy", later: "Vielleicht später",
    },
  },
  FR: {
    title: "Retrouve tout ce dont tu te souviens",
    subtitle: "Décris la chanson, la vidéo ou le compte dont tu as oublié le nom — l'IA cherche sur le web.",
    types: ["Chanson", "Vidéo", "Compte"],
    find: "Trouver", finding: "Recherche...",
    results: "Résultats", tryAgain: "Réessayer",
    freeLeft: (n) => `${n} recherche${n !== 1 ? "s" : ""} gratuite${n !== 1 ? "s" : ""} restante${n !== 1 ? "s" : ""}`,
    noFree: "Plus de recherches gratuites — Choisir un plan",
    hint: "Plus de détails = meilleurs résultats.",
    disclaimer: "Résultats trouvés via recherche web + analyse IA.",
    searching: "L'IA cherche sur le web, patiente...",
    errMsg: "Aucun résultat trouvé. Essaie de reformuler la description.",
    placeholder: {
      song: "Ex : chanson lente de 2016, voix féminine, le refrain répète 'reviens'...",
      video: "Ex : enfant jouant avec un chien, sweat jaune, neige en arrière-plan...",
      account: "Ex : fille rousse, vidéos de voyage, montages drôles sur TikTok...",
    },
    paywall: {
      title: "Plus de recherches gratuites",
      subtitle: "Choisis un plan pour continuer :",
      pack: "Pack de recherches", packDesc: "Achat unique, sans expiration",
      sub: "Plan illimité", subDesc: "Recherches illimitées, annulable à tout moment",
      popular: "LE PLUS POPULAIRE", cta: "Continuer vers le paiement →",
      secure: "Paiement sécurisé · Propulsé par Lemon Squeezy", later: "Plus tard",
    },
  },
  ES: {
    title: "Encuentra todo lo que recuerdas",
    subtitle: "Describe la canción, video o cuenta cuyo nombre olvidaste — la IA busca en la web.",
    types: ["Canción", "Video", "Cuenta"],
    find: "Buscar", finding: "Buscando...",
    results: "Resultados", tryAgain: "Intentar de nuevo",
    freeLeft: (n) => `Te quedan ${n} búsqueda${n !== 1 ? "s" : ""} gratis`,
    noFree: "Sin búsquedas gratis — Elige un plan",
    hint: "Más detalles = mejores resultados.",
    disclaimer: "Resultados encontrados mediante búsqueda web + análisis de IA.",
    searching: "La IA está buscando en la web, espera...",
    errMsg: "No se encontraron resultados. Intenta reformular la descripción.",
    placeholder: {
      song: "Ej: canción lenta de 2016, voz femenina, el coro repite 'vuelve'...",
      video: "Ej: niño jugando con un perro, sudadera amarilla, nieve de fondo...",
      account: "Ej: chica pelirroja, videos de viajes, ediciones graciosas en TikTok...",
    },
    paywall: {
      title: "Sin búsquedas gratis",
      subtitle: "Elige un plan para continuar:",
      pack: "Paquete de búsquedas", packDesc: "Pago único, sin caducidad",
      sub: "Plan ilimitado", subDesc: "Búsquedas ilimitadas, cancela cuando quieras",
      popular: "MÁS POPULAR", cta: "Continuar al pago →",
      secure: "Pago seguro · Con tecnología de Lemon Squeezy", later: "Más tarde",
    },
  },
};

const PACK_PRICE = { song: "$0.99", video: "$2.99", account: "$1.99" };

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
    localStorage.setItem("findit_v2", JSON.stringify({ ...usage, month: new Date().toISOString().slice(0, 7) }));
  } catch { }
}

function PaywallModal({ t, neon, glow, typeKey, onClose }) {
  const [selected, setSelected] = useState("sub");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(8,8,16,0.93)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#0F0F1A", border: `1.5px solid ${neon}55`,
        borderRadius: 24, padding: "36px 32px", maxWidth: 400, width: "100%", boxShadow: glow,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#F0F0FF" }}>{t.paywall.title}</h2>
          <p style={{ margin: 0, color: "#8888AA", fontSize: 14 }}>{t.paywall.subtitle}</p>
        </div>

        <div onClick={() => setSelected("pack")} style={{
          border: `2px solid ${selected === "pack" ? neon : "#FFFFFF15"}`,
          borderRadius: 14, padding: "16px 20px", marginBottom: 12,
          cursor: "pointer", background: selected === "pack" ? `${neon}11` : "transparent", transition: "all 0.2s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#F0F0FF" }}>{t.paywall.pack}</div>
              <div style={{ fontSize: 13, color: "#8888AA", marginTop: 3 }}>{t.paywall.packDesc}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: selected === "pack" ? neon : "#F0F0FF" }}>{PACK_PRICE[typeKey]}</div>
          </div>
        </div>

        <div onClick={() => setSelected("sub")} style={{
          border: `2px solid ${selected === "sub" ? neon : "#FFFFFF15"}`,
          borderRadius: 14, padding: "16px 20px", marginBottom: 24,
          cursor: "pointer", background: selected === "sub" ? `${neon}11` : "transparent",
          transition: "all 0.2s", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -11, right: 16, background: neon, color: "#080810",
            fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 100,
          }}>{t.paywall.popular}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#F0F0FF" }}>{t.paywall.sub}</div>
              <div style={{ fontSize: 13, color: "#8888AA", marginTop: 3 }}>{t.paywall.subDesc}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 22, color: selected === "sub" ? neon : "#F0F0FF" }}>
              $4.99<span style={{ fontSize: 13, fontWeight: 400, color: "#8888AA" }}>/mo</span>
            </div>
          </div>
        </div>

        <a href={CHECKOUT_URLS[selected]} style={{ textDecoration: "none", display: "block" }}>
          <button style={{
            width: "100%", padding: "15px", borderRadius: 12, border: "none",
            background: neon, color: "#080810", fontWeight: 800, fontSize: 16,
            cursor: "pointer", boxShadow: glow, marginBottom: 10,
          }}>{t.paywall.cta}</button>
        </a>
        <p style={{ textAlign: "center", fontSize: 11, color: "#FFFFFF33", margin: "0 0 10px" }}>{t.paywall.secure}</p>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", borderRadius: 12,
          border: "1px solid #FFFFFF15", background: "transparent", color: "#8888AA", fontSize: 14, cursor: "pointer",
        }}>{t.paywall.later}</button>
      </div>
    </div>
  );
}

function AdBanner() {
  const containerRef = useState(() => Math.random().toString(36).slice(2))[0];
  useEffect(() => {
    const el = document.getElementById(containerRef);
    if (!el || el.dataset.loaded) return;
    el.dataset.loaded = "1";
    const s1 = document.createElement("script");
    s1.innerHTML = `atOptions = {'key' : 'a26c83e6e62b68750b3f7cb4d670a455','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};`;
    const s2 = document.createElement("script");
    s2.src = "https://www.highperformanceformat.com/a26c83e6e62b68750b3f7cb4d670a455/invoke.js";
    el.appendChild(s1);
    el.appendChild(s2);
  }, [containerRef]);
  return <div id={containerRef} style={{ display: "flex", justifyContent: "center", margin: "20px 0" }} />;
}

function NativeBanner() {
  useEffect(() => {
    const el = document.getElementById("container-18101e24e7b8b9b9fedef390296dc747");
    if (!el || el.dataset.loaded) return;
    el.dataset.loaded = "1";
    const s = document.createElement("script");
    s.async = true;
    s.dataset.cfasync = "false";
    s.src = "https://pl30421796.effectivecpmnetwork.com/18101e24e7b8b9b9fedef390296dc747/invoke.js";
    el.appendChild(s);
  }, []);
  return <div id="container-18101e24e7b8b9b9fedef390296dc747" style={{ margin: "20px 0" }} />;
}

function triggerPopunder() {
  try {
    const s = document.createElement("script");
    s.src = "https://pl30424476.effectivecpmnetwork.com/4a/47/fb/4a47fb8e6992d60e29b9c6a9775bb043.js";
    document.body.appendChild(s);
  } catch { }
}

export default function App() {
  const [lang, setLang] = useState("EN");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [typeIdx, setTypeIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(() => getUsage());
  const [showPaywall, setShowPaywall] = useState(false);
  const [premium, setPremiumFlag] = useState(() => isPremium());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("premium") === "1") {
      markPremium();
      setPremiumFlag(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const t = TEXT[lang];
  const typeKey = TYPE_KEYS[typeIdx];
  const neon = NEON[typeKey];
  const glow = NEON_GLOW[typeKey];
  const freeLimit = FREE_LIMITS[typeKey];
  const usedCount = usage[typeKey] || 0;
  const remaining = Math.max(0, freeLimit - usedCount);
  const isRTL = lang === "AR";

  async function handleFind() {
    if (!query.trim() || loading) return;
    if (!premium && remaining <= 0) { setShowPaywall(true); return; }
    if (!premium) triggerPopunder();

    setLoading(true);
    setResults(null);
    setError("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `You are an expert at identifying songs, videos, and social media accounts from vague descriptions.
Search the web to find the best matches.

CRITICAL RULE ABOUT LINKS: You must ONLY use direct_link URLs that literally appeared in your web search tool results (the "url" field of a search result). NEVER construct, guess, or hallucinate a URL yourself — not even one that "looks right". If you cannot find an exact matching URL in your search results for an item, use the search result page URL itself instead of inventing a video/watch URL. A wrong but real URL is acceptable; a fabricated URL is not.

Respond ONLY with valid JSON, no extra text, no markdown:
{
  "matches": [
    {
      "title": "Exact song/video/account name",
      "artist_or_creator": "Artist or creator name",
      "year": "Year if known",
      "why": "Why this matches in 1 sentence",
      "direct_link": "A URL copied verbatim from your search results — never invented",
      "platform": "Spotify / YouTube / TikTok / Instagram"
    }
  ],
  "tips": "One tip to help narrow it down"
}
Give 3-5 matches ordered by likelihood. Respond in ${LANGS[lang].name}.`,
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
      const newUsage = { ...usage, [typeKey]: usedCount + 1 };
      setUsage(newUsage);
      saveUsage(newUsage);

    } catch {
      setError(t.errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#080810", color: "#F0F0FF", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {showPaywall && (
        <PaywallModal t={t} neon={neon} glow={glow} typeKey={typeKey} onClose={() => setShowPaywall(false)} />
      )}

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse at 20% 20%, ${neon}18 0%, transparent 60%),
                     radial-gradient(ellipse at 80% 80%, ${neon}10 0%, transparent 55%)`,
        transition: "background 0.5s",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 20px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: neon, textShadow: glow, transition: "all 0.4s" }}>
            ◈ Zindly
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowLangMenu(v => !v)} style={{
              background: "transparent", border: `1.5px solid ${neon}55`,
              color: neon, borderRadius: 8, padding: "6px 16px",
              cursor: "pointer", fontSize: 13, fontWeight: 700,
            }}>{LANGS[lang].label} ▾</button>
            {showLangMenu && (
              <div style={{
                position: "absolute", top: "110%", right: isRTL ? "auto" : 0, left: isRTL ? 0 : "auto",
                background: "#0F0F1A", border: `1px solid ${neon}44`, borderRadius: 12,
                padding: 6, zIndex: 50, minWidth: 140, boxShadow: glow,
              }}>
                {Object.keys(LANGS).map(code => (
                  <div key={code} onClick={() => { setLang(code); setShowLangMenu(false); }} style={{
                    padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                    color: code === lang ? neon : "#F0F0FF",
                    background: code === lang ? `${neon}15` : "transparent",
                  }}>{LANGS[code].label}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "48px 0 36px" }}>
          <h1 style={{
            fontSize: "clamp(26px,5.5vw,50px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 14px",
            background: `linear-gradient(135deg, #ffffff 40%, ${neon})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{t.title}</h1>
          <p style={{ color: "#8888AA", fontSize: 15, margin: 0, lineHeight: 1.7 }}>{t.subtitle}</p>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
          {t.types.map((label, i) => {
            const tk = TYPE_KEYS[i];
            const rem = Math.max(0, FREE_LIMITS[tk] - (usage[tk] || 0));
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
                }}>{premium ? "∞" : `${rem}/${FREE_LIMITS[tk]}`}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          background: "#0F0F1A", border: `1.5px solid ${neon}33`,
          borderRadius: 16, padding: 4, marginBottom: 10,
          boxShadow: `0 0 40px ${neon}0D`, transition: "all 0.4s",
        }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFind(); } }}
            placeholder={t.placeholder[typeKey]}
            rows={4}
            style={{
              width: "100%", background: "transparent", border: "none",
              color: "#F0F0FF", fontSize: 15, lineHeight: 1.7,
              padding: "16px 20px", resize: "none", outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          <div style={{ padding: "0 12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#FFFFFF33" }}>{t.hint}</span>
            <button onClick={handleFind} disabled={loading || !query.trim()} style={{
              padding: "11px 30px", borderRadius: 10,
              cursor: (!loading && query.trim()) ? "pointer" : "not-allowed",
              fontWeight: 700, fontSize: 15, border: "none",
              background: (!loading && query.trim()) ? neon : "#FFFFFF11",
              color: (!loading && query.trim()) ? "#080810" : "#8888AA",
              boxShadow: (!loading && query.trim()) ? glow : "none",
              transition: "all 0.3s",
            }}>{loading ? t.finding : t.find}</button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {!premium && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6 }}>
              {[...Array(freeLimit)].map((_, i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: i < usedCount ? "#FFFFFF15" : neon,
                  boxShadow: i < usedCount ? "none" : glow, transition: "all 0.4s",
                }} />
              ))}
            </div>
          )}
          {premium ? (
            <span style={{ fontSize: 13, color: neon, fontWeight: 700 }}>✦ Premium</span>
          ) : remaining > 0 ? (
            <span style={{ fontSize: 13, color: "#8888AA" }}>{t.freeLeft(remaining)}</span>
          ) : (
            <span onClick={() => setShowPaywall(true)} style={{
              fontSize: 13, color: "#FF2D78", cursor: "pointer",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}>{t.noFree}</span>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 34, marginBottom: 10, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</div>
            <p style={{ color: "#8888AA", fontSize: 14, margin: 0 }}>{t.searching}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: "#FF2D7815", border: "1px solid #FF2D7833",
            borderRadius: 12, padding: "14px 18px", marginBottom: 20, color: "#FF8888", fontSize: 14,
          }}>{error}</div>
        )}

        {results && !loading && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: neon }}>{t.results}</h2>
              <button onClick={() => { setResults(null); setQuery(""); }} style={{
                background: "transparent", border: "1px solid #FFFFFF15",
                color: "#8888AA", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 13,
              }}>{t.tryAgain}</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.matches?.map((m, i) => (
                <a key={i} href={m.direct_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#0F0F1A", border: `1.5px solid ${i === 0 ? neon + "55" : "#FFFFFF0D"}`,
                    borderRadius: 14, padding: "16px 18px",
                    boxShadow: i === 0 ? `0 0 24px ${neon}18` : "none", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = neon + "88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = i === 0 ? neon + "55" : "#FFFFFF0D"; e.currentTarget.style.transform = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                          {i === 0 && (
                            <span style={{ background: neon, color: "#080810", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100 }}>#1</span>
                          )}
                          {m.platform && (
                            <span style={{ background: "#FFFFFF0D", color: "#8888AA", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100 }}>{m.platform}</span>
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
              }}>💡 {results.tips}</div>
            )}
            <NativeBanner />
            <AdBanner />
            <p style={{ textAlign: "center", fontSize: 11, color: "#FFFFFF22", marginTop: 18 }}>{t.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}