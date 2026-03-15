import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Camera, Heart, MapPin, MessageSquare, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { CountdownDisplay } from "@/components/interactive/CountdownDisplay";
import { GuestMessageForm } from "@/components/guestbook/GuestMessageForm";
import { MessageList } from "@/components/guestbook/MessageList";
import { ParallaxHero } from "@/components/interactive/ParallaxHero";
import { TiltCard } from "@/components/interactive/TiltCard";
import { weddingConfig } from "@/lib/config";
import { getInvitationOverview } from "@/modules/elegant/invitation-engine";
import { getGuestMessages } from "@/modules/premium/guestbook-system";
import { getSlideshowPhotos } from "@/modules/premium/photo-gallery";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: `${weddingConfig.brideName} & ${weddingConfig.groomName} | ${weddingConfig.celebrationTitle}`,
  description: weddingConfig.heroSubtitle,
};

/* ── Hardcoded palette so colours always render ── */
const R  = "#C0364A"; // rose
const W  = "#FFFFFF"; // white
const I  = "#1A1012"; // ink
const I2 = "#3D2530"; // ink-2
const I3 = "#7A5460"; // ink-3
const BG = "#FAF8F6"; // warm bg
const LN = "#F4EFE9"; // linen
const BD = "#E4D8D4"; // border
const BF = "var(--font-body), system-ui, sans-serif";
const DF = "var(--font-display), Georgia, serif";
const STRIPE_BG = `linear-gradient(90deg,#D94F62 0%,${R} 25%,#B8820A 50%,${R} 75%,#D94F62 100%)`;

export default async function HomePage() {
  const [overview, msgs, slides] = await Promise.all([
    getInvitationOverview(),
    getGuestMessages(),
    Promise.resolve(getSlideshowPhotos()),
  ]);

  const bf   = weddingConfig.brideName.split(" ")[0]!;
  const gf   = weddingConfig.groomName.split(" ")[0]!;
  const hero = slides[0]?.imageUrl ?? "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80";

  const features = [
    { icon: Heart,         label: "Personal invite",  desc: "A cinematic wax-seal envelope, crafted just for you.",      href: "/invite/john-family" },
    { icon: Calendar,      label: "Full itinerary",   desc: "Three days of events with maps, dress codes and saves.",      href: "/events" },
    { icon: MessageSquare, label: "Guestbook",         desc: "Leave a blessing that stays with the couple forever.",        href: "/guestbook" },
    { icon: Camera,         label: "Photo gallery",    desc: "Every professional and candid photo, curated & downloadable.",href: "/gallery" },
    { icon: MapPin,         label: "Travel guide",     desc: "Hotels, transport, nearby essentials — arrive in style.",    href: "/travel" },
    { icon: Sparkles,       label: "Predictions",      desc: "Cast your guesses before the vows. Revealed at reception.",  href: "/predictions" },
  ];

  return (
    <div style={{ background: W, overflowX: "hidden", color: I }}>
      <style>{`
        @media(min-width:1024px){#hero-cd{display:block!important}}
        @media(max-width:768px){.r2,.r3,.rs{grid-template-columns:1fr!important}.rs>div{order:0!important}}
        @media(max-width:600px){.hg{grid-template-columns:1fr!important}}
        .feat-cell:hover{background:${BG}!important}
      `}</style>

      {/* HERO Section */}
      <ParallaxHero
        backgroundSrc={hero}
        minHeight="100vh"
        speed={0.35}
        overlay="linear-gradient(to bottom,rgba(26,16,18,.28) 0%,rgba(26,16,18,.08) 35%,rgba(26,16,18,.55) 68%,rgba(26,16,18,.96) 100%)"
      >
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.10)", overflow: "hidden", padding: "9px 0", background: "rgba(26,16,18,.20)", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", gap: "3rem", whiteSpace: "nowrap", animation: "marquee 35s linear infinite" }}>
            {Array(8).fill(`${weddingConfig.celebrationTitle} · ${formatDate(weddingConfig.weddingDate)} · ${weddingConfig.venueName} · ${weddingConfig.venueCity}`).map((t, i) => (
              <span key={i} style={{ fontSize: "0.6rem", letterSpacing: ".30em", textTransform: "uppercase", color: "rgba(255,255,255,.50)", fontFamily: BF }}>
                {t} &nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end" style={{ padding: "0 clamp(1.25rem,5vw,4rem) 4rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2.5rem", alignItems: "flex-end" }} className="hg">
              <div>
                <div className="animate-fade-in" style={{ display: "inline-flex", alignItems: "center", gap: ".625rem", padding: "6px 18px", borderRadius: 999, marginBottom: "1.5rem", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)", backdropFilter: "blur(16px)" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F5C5CB" }} className="animate-ping-soft" />
                  <span style={{ fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,.88)", fontFamily: BF, fontWeight: 600 }}>
                    {formatDate(weddingConfig.weddingDate)} · {weddingConfig.venueCity}
                  </span>
                </div>
                <h1 className="animate-fade-up" style={{ fontFamily: DF, fontSize: "clamp(3.5rem,12vw,9.5rem)", fontWeight: 700, lineHeight: .88, letterSpacing: "-.03em", color: W, marginBottom: ".18em", textShadow: "0 2px 16px rgba(0,0,0,.25)" }}>
                  {bf}
                </h1>
                <h1 className="animate-fade-up delay-100" style={{ fontFamily: DF, fontSize: "clamp(3.5rem,12vw,9.5rem)", fontWeight: 700, lineHeight: .88, letterSpacing: "-.03em", color: "#F5C5CB", marginBottom: ".35em", textShadow: "0 2px 16px rgba(0,0,0,.25)" }}>
                  &amp; {gf}
                </h1>
                <p className="animate-fade-up delay-200" style={{ fontSize: "clamp(.875rem,1.8vw,1.0625rem)", color: "rgba(255,255,255,.70)", maxWidth: "38rem", lineHeight: 1.78, marginBottom: "2.25rem", fontFamily: BF }}>
                  {weddingConfig.heroSubtitle}
                </p>
                <div className="animate-fade-up delay-300" style={{ display: "flex", flexWrap: "wrap", gap: ".875rem" }}>
                  <Link href="/rsvp" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 999, background: R, color: W, fontSize: ".9375rem", fontWeight: 700, fontFamily: BF, textDecoration: "none", boxShadow: "0 6px 24px rgba(192,54,74,.35)", transition: "transform .18s,box-shadow .18s" }}>
                    RSVP now <ArrowRight size={16} />
                  </Link>
                  <Link href="/invite/john-family" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 999, background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.90)", fontSize: ".9rem", fontWeight: 600, fontFamily: BF, textDecoration: "none", border: "1.5px solid rgba(255,255,255,.25)", backdropFilter: "blur(8px)" }}>
                    View invite
                  </Link>
                </div>
              </div>

              <div id="hero-cd" style={{ display: "none" }} className="animate-fade-up delay-400">
                <div style={{ background: "rgba(255,255,255,.11)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 24, padding: "1.75rem 2rem", minWidth: 280 }}>
                  <p style={{ fontSize: ".58rem", letterSpacing: ".32em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", fontWeight: 700, textAlign: "center", marginBottom: "1.25rem", fontFamily: BF }}>
                    Counting down ✦
                  </p>
                  <CountdownDisplay targetDate={weddingConfig.weddingDate} targetTime={weddingConfig.weddingTime} dark />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(26,16,18,.85)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,5vw,4rem)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[
              { Icon: Calendar, label: "Date",  value: formatDate(weddingConfig.weddingDate) },
              { Icon: MapPin,   label: "Venue", value: weddingConfig.venueName },
              { Icon: Sparkles, label: "Dress", value: weddingConfig.dressCode.split(",")[0]! },
            ].map(({ Icon, label, value }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: ".875rem", padding: "1.125rem 1rem", borderLeft: i > 0 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                <Icon size={15} style={{ color: "#F5C5CB", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: ".5rem", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", fontFamily: BF, fontWeight: 600 }}>{label}</p>
                  <p style={{ fontSize: ".80rem", color: "rgba(255,255,255,.88)", fontFamily: BF, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ParallaxHero>

      {/* INVITATION Section */}
      <section style={{ background: BG, padding: "6rem clamp(1.25rem,5vw,4rem)", borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="r2">
            <ScrollReveal variant="left">
              <div>
                <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: I3, marginBottom: "1.75rem", fontFamily: BF }}>
                  Together with their families
                </p>
                <h2 style={{ fontFamily: DF, fontSize: "clamp(2.25rem,5.5vw,4.5rem)", fontWeight: 700, lineHeight: .95, letterSpacing: "-.025em", color: I, marginBottom: "1.5rem" }}>
                  {weddingConfig.brideName}<br />
                  <em style={{ color: I3, fontStyle: "italic" }}>&amp;</em><br />
                  {weddingConfig.groomName}
                </h2>
                <p style={{ fontSize: "1.0625rem", color: I2, lineHeight: 1.80, maxWidth: "30rem", marginBottom: "2rem", fontFamily: BF, fontStyle: "italic" }}>
                  "{weddingConfig.introQuote}"
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".625rem" }}>
                  {[
                    { Icon: Calendar, text: formatDate(weddingConfig.weddingDate) },
                    { Icon: MapPin,   text: weddingConfig.venueName },
                  ].map(({ Icon, text }) => (
                    <div key={text} style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", padding: "8px 16px", borderRadius: 999, background: W, border: `1px solid ${BD}`, fontSize: ".85rem", fontWeight: 600, color: I, fontFamily: BF }}>
                      <Icon size={13} style={{ color: R }} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="right" delay={2}>
              <div style={{ background: R, borderRadius: 28, padding: "3rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.75rem", boxShadow: "0 20px 60px rgba(192,54,74,.25)" }}>
                <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(255,255,255,.70)", fontFamily: BF }}>
                  You are invited
                </p>
                <h3 style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-.02em", color: W }}>
                  Join us for three days of music, blessings, and forever.
                </h3>
                <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.70)", lineHeight: 1.72, fontFamily: BF }}>
                  {weddingConfig.venueAddress}, {weddingConfig.venueCity}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                  <Link href="/rsvp" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 14, background: W, color: R, fontSize: ".9rem", fontWeight: 700, fontFamily: BF, textDecoration: "none" }}>
                    Confirm attendance <ArrowRight size={15} />
                  </Link>
                  <Link href="/events" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.88)", fontSize: ".9rem", fontWeight: 600, fontFamily: BF, textDecoration: "none", border: "1.5px solid rgba(255,255,255,.25)" }}>
                    View full schedule
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* DETAILS Section */}
      <section style={{ background: LN, padding: "6rem clamp(1.25rem,5vw,4rem)", borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "3.5rem", fontFamily: BF }}>
              The details
            </p>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }} className="r3">
            <ScrollReveal variant="left" delay={1}>
              <TiltCard intensity={10} style={{ background: W, border: `1px solid ${BD}` }}>
                <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260 }}>
                  <Calendar size={28} style={{ color: R }} />
                  <div>
                    <p style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: I3, marginBottom: ".625rem", fontFamily: BF }}>Date &amp; Time</p>
                    <p style={{ fontFamily: DF, fontSize: "clamp(1.5rem,3.5vw,2.25rem)", fontWeight: 700, lineHeight: 1, color: I, marginBottom: ".375rem" }}>
                      {formatDate(weddingConfig.weddingDate)}
                    </p>
                    <p style={{ fontSize: "1rem", color: I3, fontFamily: BF }}>{weddingConfig.weddingTime} IST</p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <TiltCard dark intensity={8} glare style={{ background: R, border: "none" }}>
                <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260, position: "relative" }}>
                  <MapPin size={28} style={{ color: "rgba(255,255,255,.75)" }} />
                  <div>
                    <p style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,255,255,.60)", marginBottom: ".625rem", fontFamily: BF }}>Venue</p>
                    <p style={{ fontFamily: DF, fontSize: "clamp(1.25rem,3vw,2rem)", fontWeight: 700, lineHeight: 1, color: W, marginBottom: ".375rem" }}>
                      {weddingConfig.venueName}
                    </p>
                    <p style={{ fontSize: ".875rem", color: "rgba(255,255,255,.65)", fontFamily: BF, lineHeight: 1.5, marginBottom: "1.25rem" }}>
                      {weddingConfig.venueAddress}<br />{weddingConfig.venueCity}
                    </p>
                    <Link href={weddingConfig.mapLink} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".8rem", fontWeight: 700, color: W, textDecoration: "underline", textUnderlineOffset: 3, fontFamily: BF, opacity: .85 }}>
                      Get directions <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal variant="right" delay={1}>
              <TiltCard intensity={10} style={{ background: W, border: `1px solid ${BD}` }}>
                <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260 }}>
                  <Sparkles size={28} style={{ color: R }} />
                  <div>
                    <p style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: I3, marginBottom: ".625rem", fontFamily: BF }}>Dress code</p>
                    <p style={{ fontFamily: DF, fontSize: "clamp(1.25rem,3vw,2rem)", fontWeight: 700, lineHeight: 1.1, color: I }}>
                      {weddingConfig.dressCode}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* LOVE STORY Section */}
      <section style={{ background: W, padding: "6rem clamp(1.25rem,5vw,4rem)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "5rem", gap: "2rem" }} className="r2">
              <div>
                <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: ".875rem", fontFamily: BF }}>The love story</p>
                <h2 style={{ fontFamily: DF, fontSize: "clamp(2.25rem,5.5vw,5rem)", fontWeight: 700, lineHeight: .92, letterSpacing: "-.025em", color: I }}>
                  How it all<br />began
                </h2>
              </div>
              <Link href="/story" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 999, background: "transparent", color: I, fontSize: ".9rem", fontWeight: 600, border: `1.5px solid ${BD}`, textDecoration: "none", fontFamily: BF, flexShrink: 0, transition: "border-color .18s,color .18s" }}>
                Full story <ArrowRight size={14} />
              </Link>
            </div>
          </ScrollReveal>

          {overview.story.map((beat, i) => (
            <div key={beat.year} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", alignItems: "center", padding: "4.5rem 0", borderTop: `1px solid ${BD}` }} className="rs">
              <ScrollReveal variant={i % 2 === 0 ? "left" : "right"} delay={1}>
                <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                  <p style={{ fontFamily: DF, fontSize: "clamp(5rem,11vw,8rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-.04em", color: "transparent", WebkitTextStroke: `1.5px ${BD}`, marginBottom: ".875rem", userSelect: "none" }}>
                    {beat.year}
                  </p>
                  <h3 style={{ fontFamily: DF, fontSize: "clamp(1.375rem,3vw,2.25rem)", fontWeight: 700, lineHeight: 1.1, color: I, marginBottom: ".875rem" }}>
                    {beat.title}
                  </h3>
                  <p style={{ fontSize: ".9375rem", color: I2, lineHeight: 1.78, fontFamily: BF }}>{beat.description}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal variant={i % 2 === 0 ? "right" : "left"} delay={2}>
                {beat.imageUrl ? (
                  <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "4/3", order: i % 2 === 0 ? 1 : 0, boxShadow: "0 12px 48px rgba(80,20,30,.13)" }}>
                    <Image src={beat.imageUrl} alt={beat.title} fill className="object-cover story-img" sizes="50vw" />
                  </div>
                ) : null}
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY Section */}
      {slides.length > 1 && (
        <section style={{ background: BG, padding: "6rem clamp(1.25rem,5vw,4rem) 0", borderTop: `1px solid ${BD}` }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <ScrollReveal>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", gap: "2rem" }} className="r2">
                <div>
                  <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: ".875rem", fontFamily: BF }}>Captured moments</p>
                  <h2 style={{ fontFamily: DF, fontSize: "clamp(2rem,5vw,4.5rem)", fontWeight: 700, lineHeight: .92, color: I }}>
                    A glimpse into<br />their world
                  </h2>
                </div>
                <Link href="/gallery" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 999, background: "transparent", color: I, fontSize: ".9rem", fontWeight: 600, border: `1.5px solid ${BD}`, textDecoration: "none", fontFamily: BF, flexShrink: 0 }}>
                  <Camera size={14} /> All photos
                </Link>
              </div>
            </ScrollReveal>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "3px" }} className="r3">
            {slides.slice(0, 6).map((slide, i) => (
              <ScrollReveal key={slide.imageUrl} variant="scale" delay={(Math.min((i % 3) + 1, 6)) as 1|2|3|4|5|6}>
                <Link href="/gallery" style={{ display: "block", position: "relative", aspectRatio: i === 0 || i === 4 ? "3/4" : "1/1", overflow: "hidden", background: LN }}>
                  <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover gallery-img" sizes="33vw" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(26,16,18,.65) 0%,transparent 45%)", display: "flex", alignItems: "flex-end", padding: "1.25rem" }}>
                    <p style={{ fontFamily: DF, fontSize: "1rem", color: W, fontWeight: 600, lineHeight: 1.2, opacity: 0.85 }}>{slide.title}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <style>{`
            .gallery-img { transition: transform .6s ease; }
            a:hover .gallery-img { transform: scale(1.04); }
            .story-img { transition: transform .6s ease; }
            div:hover .story-img { transform: scale(1.04); }
          `}</style>
        </section>
      )}

      {/* FEATURES Section */}
      <section style={{ background: BG, padding: "6rem clamp(1.25rem,5vw,4rem)", borderTop: `1px solid ${BD}` }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ marginBottom: "4rem" }}>
              <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "1.25rem", fontFamily: BF }}>Your celebration experience</p>
              <h2 style={{ fontFamily: DF, fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 700, lineHeight: .92, color: I, maxWidth: "14ch" }}>
                Everything in one place
              </h2>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: BD }} className="r3">
            {features.map(({ icon: Icon, label, desc, href }, i) => {
              const featured = i === 0 || i === 5;
              return (
                <ScrollReveal key={label} variant="scale" delay={(Math.min(i + 1, 6)) as 1|2|3|4|5|6}>
                  <Link href={href} className={featured ? "" : "feat-cell"} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2.25rem 2rem", minHeight: 220, background: featured ? R : W, textDecoration: "none", transition: "background .2s" }}>
                    <Icon size={26} style={{ color: featured ? "rgba(255,255,255,.85)" : R }} />
                    <div>
                      <h3 style={{ fontFamily: DF, fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.1, color: featured ? W : I, marginBottom: ".5rem" }}>
                        {label}
                      </h3>
                      <p style={{ fontSize: ".875rem", color: featured ? "rgba(255,255,255,.70)" : I3, lineHeight: 1.58, fontFamily: BF }}>
                        {desc}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* GUESTBOOK Section */}
      <section style={{ background: W, padding: "6rem clamp(1.25rem,5vw,4rem)", borderTop: `1px solid ${BD}` }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ marginBottom: "4rem" }}>
              <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: R, marginBottom: "1rem", fontFamily: BF }}>Guestbook</p>
              <h2 style={{ fontFamily: DF, fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 700, lineHeight: .92, color: I }}>
                Leave your<br />blessing ✨
              </h2>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3rem", alignItems: "start" }} className="r2">
            <ScrollReveal variant="left">
              <div>
                <p style={{ fontSize: ".65rem", fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: I3, marginBottom: "1.25rem", fontFamily: BF }}>
                  {msgs.length} blessing{msgs.length !== 1 ? "s" : ""} received
                </p>
                <MessageList messages={msgs.slice(0, 4)} />
                {msgs.length > 4 && (
                  <Link href="/guestbook" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "1.25rem", fontSize: ".875rem", fontWeight: 700, color: R, fontFamily: BF }}>
                    Read all <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </ScrollReveal>
            <ScrollReveal variant="right">
              <GuestMessageForm weddingId={weddingConfig.id} />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* RSVP CTA Section */}
      <section style={{ position: "relative", overflow: "hidden", padding: "7rem clamp(1.25rem,5vw,4rem)", textAlign: "center", background: I }}>
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(192,54,74,.12) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ height: 3, background: STRIPE_BG, position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <ScrollReveal variant="scale">
            <p style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(255,255,255,.32)", marginBottom: "2rem", fontFamily: BF }}>
              {formatDate(weddingConfig.weddingDate)}
            </p>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(3rem,11vw,8.5rem)", fontWeight: 700, lineHeight: .88, letterSpacing: "-.035em", color: W, marginBottom: "2rem" }}>
              Will you<br />be there?
            </h2>
            <p style={{ fontSize: "clamp(.9rem,1.8vw,1.125rem)", color: "rgba(255,255,255,.52)", maxWidth: "34rem", margin: "0 auto 3rem", lineHeight: 1.78, fontFamily: BF }}>
              Let {bf} and {gf} know — every face is part of the story.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <Link href="/rsvp" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", borderRadius: 999, background: R, color: W, fontSize: "1rem", fontWeight: 700, fontFamily: BF, textDecoration: "none", boxShadow: "0 8px 32px rgba(192,54,74,.35)", transition: "transform .18s" }}>
                RSVP now <ArrowRight size={17} />
              </Link>
              <Link href="/invite/john-family" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 30px", borderRadius: 999, background: "rgba(255,255,255,.10)", color: "rgba(255,255,255,.90)", fontSize: ".95rem", fontWeight: 600, fontFamily: BF, textDecoration: "none", border: "1.5px solid rgba(255,255,255,.25)", backdropFilter: "blur(8px)" }}>
                View your invite
              </Link>
            </div>
          </ScrollReveal>
        </div>
        <div style={{ height: 3, background: STRIPE_BG, position: "absolute", bottom: 0, left: 0, right: 0 }} />
      </section>
    </div>
  );
}