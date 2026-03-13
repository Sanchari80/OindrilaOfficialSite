import { useState, useEffect, useRef } from "react";

// ──────────────────────────────────────────────
// SAMPLE DATA — admin থেকে যে data আসবে সেটা
// এই format এ pass করবেন
// ──────────────────────────────────────────────
const sampleAnnouncements = [
  {
    id: 1,
    icon: "🎬",
    title: "Grand Opening — New Season Begins",
    badge: "new",
    frameNumber: "001",
    postedBy: "Admin",
    date: "06 MAR 2026",
    eventDate: "March 15, 2026",
    location: "Main Hall",
    audience: "All Members",
    poster: null, // poster image url দিন, null হলে placeholder দেখাবে
    content:
      "We are thrilled to announce the grand opening of our new season. This marks a pivotal moment in our journey — expect exclusive previews, live performances, and surprise announcements from our team. Doors open at 7:00 PM sharp. Dress code: smart casual.",
    ctaPrimary: "Register Now",
    ctaSecondary: "Learn More",
  },
  {
    id: 2,
    icon: "🔧",
    title: "Platform Update v3.2 — New Features Released",
    badge: "update",
    frameNumber: "002",
    postedBy: "System",
    date: "04 MAR 2026",
    eventDate: "Effective Immediately",
    location: null,
    audience: "All Users",
    poster: null,
    content:
      "Version 3.2 is now live across all environments. Key highlights include redesigned dashboard components, faster load times (up to 40% improvement), and a new notification center. Please clear your cache and refresh. Report any issues to the support channel.",
    ctaPrimary: "View Changelog",
    ctaSecondary: "Report Issue",
  },
  {
    id: 3,
    icon: "🎭",
    title: "Annual Gala Night — Save The Date",
    badge: "event",
    frameNumber: "003",
    postedBy: "Admin",
    date: "01 MAR 2026",
    eventDate: "April 20, 2026",
    location: "Grand Ballroom",
    audience: "Invite Only",
    poster: null,
    content:
      "Our most celebrated evening of the year returns. An unforgettable night of awards, entertainment, and networking with the finest in the industry. Invitations will be dispatched by April 1st. Seats are strictly limited — confirm your attendance early.",
    ctaPrimary: "Confirm Attendance",
    ctaSecondary: "Details",
  },
];

// ──────────────────────────────────────────────
// Badge component
// ──────────────────────────────────────────────
const Badge = ({ type }) => {
  const styles = {
    new: "bg-red-700 text-white",
    update: "bg-yellow-900/40 text-yellow-400 border border-yellow-600/40",
    event: "bg-white/5 text-stone-300 border border-white/15",
  };
  const labels = { new: "New", update: "Update", event: "Event" };
  return (
    <span
      className={`text-[0.6rem] tracking-widest uppercase px-2 py-1 rounded-sm font-mono shrink-0 ${styles[type] || styles.event}`}
    >
      {labels[type] || type}
    </span>
  );
};

// ──────────────────────────────────────────────
// Single Card
// ──────────────────────────────────────────────
const FilmCard = ({ data, isOpen, onToggle }) => {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* ── Title Bar ── */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 border rounded-sm relative overflow-hidden
          ${isOpen
            ? "bg-[#2e1c0b] border-yellow-600 rounded-b-none"
            : "bg-[#2a1f0e] border-yellow-900/30 hover:border-yellow-600/50 hover:bg-[#321e0f]"
          }`}
      >
        {/* left accent bar */}
        <span
          className={`absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-50"}`}
        />

        <span className="text-lg shrink-0">{data.icon}</span>

        <span
          className={`flex-1 font-black tracking-widest uppercase text-sm transition-colors duration-300
            ${isOpen ? "text-yellow-300" : "text-stone-200"}`}
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.12em" }}
        >
          {data.title}
        </span>

        <Badge type={data.badge} />

        {/* arrow */}
        <span
          className={`w-5 h-5 rounded-full border flex items-center justify-center text-yellow-500 text-[0.6rem] transition-all duration-500 shrink-0
            ${isOpen ? "rotate-180 border-yellow-500" : "border-yellow-800"}`}
        >
          ▼
        </span>
      </button>

      {/* ── Expand Body ── */}
      <div
        style={{ height, transition: "height 0.55s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden" }}
      >
        <div ref={bodyRef}>
          <div className="border border-yellow-600 border-t-0 rounded-b-sm bg-[#141410] relative overflow-hidden">

            {/* corner marks */}
            <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-yellow-600/50 z-10" />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-600/50 z-10" />

            {/* Poster */}
            {data.poster ? (
              <img
                src={data.poster}
                alt={data.title}
                className="w-full h-52 object-cover block"
                style={{ filter: "sepia(0.15) contrast(1.05)" }}
              />
            ) : (
              <div className="w-full h-52 bg-gradient-to-br from-[#1a1208] via-[#2d1f0a] to-[#1a1510] flex items-center justify-center relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg,transparent,transparent 30px,#c9a84c 30px,#c9a84c 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,#c9a84c 30px,#c9a84c 31px)",
                  }}
                />
                <span
                  className="text-6xl text-yellow-600/10 tracking-widest z-10"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  POSTER
                </span>
                {/* gradient fade bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#141410] to-transparent" />
              </div>
            )}

            {/* Frame strip */}
            <div className="bg-[#1a1a15] border-y border-yellow-900/20 px-4 py-1 flex items-center gap-3 font-mono text-[0.6rem] tracking-widest text-yellow-700">
              <span className="text-yellow-500">FRAME {data.frameNumber}</span>
              <span>◆</span>
              <span>{data.postedBy.toUpperCase()}</span>
              <span>◆</span>
              <span>{data.date}</span>
            </div>

            {/* Content */}
            <div className="px-5 py-5 pb-10">
              <h3
                className="text-yellow-300 text-2xl mb-3 tracking-wide leading-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {data.title}
              </h3>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-mono text-[0.65rem] tracking-widest text-yellow-700 uppercase">
                  📅 {data.eventDate}
                </span>
                {data.location && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-yellow-900" />
                    <span className="font-mono text-[0.65rem] tracking-widest text-yellow-700 uppercase">
                      🏛️ {data.location}
                    </span>
                  </>
                )}
                {data.audience && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-yellow-900" />
                    <span className="font-mono text-[0.65rem] tracking-widest text-yellow-700 uppercase">
                      {data.audience}
                    </span>
                  </>
                )}
              </div>

              <p className="text-stone-400 leading-relaxed text-[0.95rem]">{data.content}</p>

              {/* CTA */}
              <div className="flex gap-2 mt-5 flex-wrap">
                {data.ctaPrimary && (
                  <button
                    className="bg-yellow-500 text-black px-5 py-2 rounded-sm text-sm tracking-widest uppercase font-black hover:bg-yellow-300 transition-all duration-200 hover:-translate-y-px"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {data.ctaPrimary}
                  </button>
                )}
                {data.ctaSecondary && (
                  <button className="border border-yellow-900/40 text-yellow-700 px-4 py-2 rounded-sm text-[0.65rem] tracking-widest uppercase font-mono hover:border-yellow-600 hover:text-yellow-500 transition-all duration-200">
                    {data.ctaSecondary}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Sprocket holes (film strip side)
// ──────────────────────────────────────────────
const Sprockets = ({ count }) => (
  <div className="flex flex-col justify-around items-center py-3 gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-[18px] h-[13px] rounded-sm bg-[#0a0a08] border border-yellow-900/20 shadow-inner shrink-0 my-1"
      />
    ))}
  </div>
);

// ──────────────────────────────────────────────
// Main Component — এটাই আপনার page এ import করবেন
// ──────────────────────────────────────────────
export default function AnnouncementCard({ announcements = sampleAnnouncements }) {
  const [openId, setOpenId] = useState(null);
  const wrapperRef = useRef(null);
  const [sprocketCount, setSprocketCount] = useState(8);

  // sprocket count update on resize / expand
  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) {
        const h = wrapperRef.current.offsetHeight;
        setSprocketCount(Math.max(6, Math.floor(h / 32)));
      }
    };
    update();
    const observer = new ResizeObserver(update);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [openId]);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10"
      style={{ background: "#0a0a08", fontFamily: "'Crimson Pro', Georgia, serif" }}
    >
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&family=Crimson+Pro:wght@400;600&display=swap');`}</style>

      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-5xl text-yellow-500 tracking-widest"
          style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 0 40px rgba(201,168,76,0.3)" }}
        >
          Announcements
        </h1>
        <p className="text-stone-600 font-mono text-xs tracking-widest uppercase mt-1">
          Click any title to expand
        </p>
      </div>

      {/* Film Strip */}
      <div ref={wrapperRef} className="w-full max-w-2xl flex relative">
        {/* Left sprocket column */}
        <div className="w-9 shrink-0 bg-[#1a1a15] border-r border-yellow-900/20">
          <Sprockets count={sprocketCount} />
        </div>

        {/* Cards area */}
        <div className="flex-1 bg-[#141410] border-y border-yellow-900/20 px-3 py-4 flex flex-col gap-3">
          {announcements.map((item, idx) => (
            <div key={item.id}>
              <FilmCard
                data={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              />
              {idx < announcements.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-yellow-900/20 to-transparent mt-3" />
              )}
            </div>
          ))}
        </div>

        {/* Right sprocket column */}
        <div className="w-9 shrink-0 bg-[#1a1a15] border-l border-yellow-900/20">
          <Sprockets count={sprocketCount} />
        </div>
      </div>
    </div>
  );
}