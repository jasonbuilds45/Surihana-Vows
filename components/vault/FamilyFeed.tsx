"use client";

/**
 * FamilyFeed — Social feed for the Family Vault
 *
 * Instagram-inspired UX with wedding branding:
 *   • Composer pinned at top, collapsed until tapped
 *   • Posts appear newest-first; optimistic insert on submit
 *   • Emoji reaction picker on every post (❤️ 🙏 😂 🥹 🎉 ✨)
 *   • Reactions are optimistic — UI updates instantly, API syncs in background
 *   • Supports photo attachment on posts
 *   • Auto-refreshes every 30s to pick up posts from other members
 *   • Skeleton loading state for initial feed hydration
 *   • Post type chips: memory / blessing / milestone / anniversary
 */

import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Camera, Loader2, PenLine, Send, Smile, Sparkles, X,
} from "lucide-react";
import type { FamilyPostRow } from "@/lib/types";

// ── Design tokens ─────────────────────────────────────────────────────────────
const DF    = "'Cormorant Garamond',Georgia,serif";
const BF    = "'Manrope',system-ui,sans-serif";
const ROSE  = "#BE2D45";
const ROSEL = "#D44860";
const GOLD  = "#9A6C06";
const INK   = "#1A0D0A";
const INK2  = "rgba(26,13,10,.62)";
const INK3  = "rgba(26,13,10,.38)";
const BG    = "#FAF6F0";
const CREAM = "#F0E4D4";
const W     = "#FFFFFF";
const BDR   = "rgba(190,45,69,.10)";

// ── Post type config ──────────────────────────────────────────────────────────
const POST_TYPES = ["memory","blessing","milestone","anniversary"] as const;
type PostType    = typeof POST_TYPES[number];
const PT_META: Record<PostType,{label:string;emoji:string;bg:string}> = {
  memory:      {label:"Memory",      emoji:"📷", bg:"rgba(190,45,69,.08)"},
  blessing:    {label:"Blessing",    emoji:"🙏", bg:"rgba(154,108,6,.08)"},
  milestone:   {label:"Milestone",   emoji:"🎯", bg:"rgba(59,130,246,.08)"},
  anniversary: {label:"Anniversary", emoji:"💍", bg:"rgba(168,85,247,.08)"},
};

// ── Reactions ─────────────────────────────────────────────────────────────────
const REACTIONS = ["❤️","🙏","😂","🥹","🎉","✨"] as const;
type Reaction    = typeof REACTIONS[number];

interface ReactionState { emoji: Reaction; count: number; mine: boolean }

// ── Enriched post type ────────────────────────────────────────────────────────
interface EnrichedPost extends FamilyPostRow {
  reactions: ReactionState[];
}

// ── Component props ───────────────────────────────────────────────────────────
interface FamilyFeedProps {
  initialPosts: FamilyPostRow[];
  weddingId:    string;
  authorEmail:  string;
  authorName:   string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000)      return "just now";
  if (d < 3_600_000)   return `${Math.floor(d/60_000)}m ago`;
  if (d < 86_400_000)  return `${Math.floor(d/3_600_000)}h ago`;
  if (d < 604_800_000) return `${Math.floor(d/86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]!.toUpperCase()).join("");
}

function displayName(email: string): string {
  const local = email.includes("@") ? email.split("@")[0]! : email;
  return local.replace(/[._-]/g," ").replace(/\b\w/g, c=>c.toUpperCase());
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_PALETTES = [
  [ROSE,  "rgba(190,45,69,.15)"],
  [GOLD,  "rgba(154,108,6,.15)"],
  ["#2D6ABE","rgba(45,106,190,.15)"],
  ["#2DBE5A","rgba(45,190,90,.15)"],
  ["#7E2DBE","rgba(126,45,190,.15)"],
];
function Avatar({name,size=40}:{name:string;size?:number}) {
  const [fg,bg] = AVATAR_PALETTES[name.charCodeAt(0)%AVATAR_PALETTES.length]!;
  return (
    <div style={{
      width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:bg,border:`1.5px solid ${fg}33`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:DF,fontWeight:600,fontSize:size*.36,color:fg,
    }}>
      {initials(name)}
    </div>
  );
}

// ── Reaction bar ──────────────────────────────────────────────────────────────
function ReactionBar({postId,initial}:{postId:string;initial:ReactionState[]}) {
  const [reactions, setReactions] = useState<ReactionState[]>(initial);
  const [picker,    setPicker]    = useState(false);
  const [bumping,   setBumping]   = useState<string|null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(()=>{
    function handle(e:MouseEvent){
      if(pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPicker(false);
    }
    document.addEventListener("mousedown",handle);
    return ()=>document.removeEventListener("mousedown",handle);
  },[]);

  async function toggle(emoji: Reaction) {
    setPicker(false);
    setBumping(emoji);
    setTimeout(()=>setBumping(null),350);

    // Optimistic update
    setReactions(prev=>{
      const hit = prev.find(r=>r.emoji===emoji);
      if(hit) {
        if(hit.mine) {
          // remove
          const next = prev.map(r=>r.emoji===emoji?{...r,count:r.count-1,mine:false}:r).filter(r=>r.count>0);
          return next;
        }
        return prev.map(r=>r.emoji===emoji?{...r,count:r.count+1,mine:true}:r);
      }
      return [...prev,{emoji,count:1,mine:true}];
    });

    // Fire and forget
    await fetch("/api/family/react",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({postId,emoji}),
    }).catch(()=>null);
  }

  return (
    <div style={{display:"flex",alignItems:"center",gap:".375rem",flexWrap:"wrap"}}>
      {/* Existing reactions */}
      {reactions.map(r=>(
        <button
          key={r.emoji}
          type="button"
          onClick={()=>toggle(r.emoji as Reaction)}
          style={{
            display:"inline-flex",alignItems:"center",gap:4,
            padding:"5px 11px",borderRadius:999,cursor:"pointer",
            background:r.mine?"rgba(190,45,69,.10)":"rgba(26,13,10,.04)",
            border:`1.5px solid ${r.mine?"rgba(190,45,69,.25)":"rgba(26,13,10,.08)"}`,
            fontFamily:BF,fontSize:".78rem",fontWeight:r.mine?700:500,
            color:r.mine?ROSE:INK3,
            transform:bumping===r.emoji?"scale(1.20)":"scale(1)",
            transition:"transform .25s cubic-bezier(.34,1.56,.64,1), background .15s, border .15s",
          }}
        >
          <span style={{fontSize:".9rem"}}>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div ref={pickerRef} style={{position:"relative"}}>
        <button
          type="button"
          onClick={()=>setPicker(p=>!p)}
          title="React"
          style={{
            width:30,height:30,borderRadius:"50%",cursor:"pointer",
            background:"rgba(26,13,10,.04)",
            border:"1.5px solid rgba(26,13,10,.08)",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:INK3,transition:"background .15s",
          }}
        >
          <Smile size={14}/>
        </button>

        {picker&&(
          <div style={{
            position:"absolute",bottom:"calc(100% + 8px)",left:0,
            display:"flex",gap:3,
            padding:"8px 10px",borderRadius:18,
            background:W,border:`1px solid ${CREAM}`,
            boxShadow:"0 10px 36px rgba(0,0,0,.14)",
            zIndex:60,
          }}>
            {REACTIONS.map(e=>(
              <button
                key={e}
                type="button"
                onClick={()=>toggle(e)}
                style={{
                  fontSize:"1.2rem",cursor:"pointer",lineHeight:1,
                  background:"none",border:"none",padding:"3px 5px",
                  borderRadius:8,transition:"transform .14s",
                }}
                onMouseEnter={ev=>(ev.currentTarget.style.transform="scale(1.32)")}
                onMouseLeave={ev=>(ev.currentTarget.style.transform="")}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({post}:{post:EnrichedPost}) {
  const pt     = PT_META[(post.post_type as PostType) ?? "memory"] ?? PT_META.memory;
  const author = post.posted_by ?? "Family member";
  const label  = author.includes("@") ? displayName(author) : author;
  const [expanded, setExpanded] = useState(false);
  const isLong = post.content.length > 220;

  return (
    <article style={{
      background:W,borderRadius:24,overflow:"hidden",
      border:`1px solid ${BDR}`,
      boxShadow:"0 4px 24px rgba(26,13,10,.06)",
    }}>
      {/* Photo — full bleed above content */}
      {post.media_url&&(
        <div style={{position:"relative",aspectRatio:"4/3",background:BG}}>
          <Image
            src={post.media_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width:640px) 100vw, 560px"
          />
        </div>
      )}

      <div style={{padding:"1rem 1.25rem",display:"flex",flexDirection:"column",gap:".75rem"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:".75rem"}}>
          <Avatar name={label} size={40}/>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontFamily:BF,fontWeight:700,fontSize:".9rem",color:INK,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {label}
            </p>
            <p style={{fontFamily:BF,fontSize:".68rem",color:INK3,marginTop:".1rem"}}>
              {timeAgo(post.created_at)}
            </p>
          </div>
          <span style={{
            display:"inline-flex",alignItems:"center",gap:5,flexShrink:0,
            padding:"4px 10px",borderRadius:999,
            background:pt.bg,
            fontFamily:BF,fontSize:".58rem",fontWeight:700,
            letterSpacing:".12em",textTransform:"uppercase",color:INK3,
          }}>
            {pt.emoji} {pt.label}
          </span>
        </div>

        {/* Title + body */}
        <div>
          <p style={{fontFamily:DF,fontWeight:400,fontSize:"clamp(1.1rem,2.8vw,1.35rem)",color:INK,lineHeight:1.18,marginBottom:post.content?".5rem":0}}>
            {post.title}
          </p>
          {post.content&&(
            <>
              <p style={{
                fontFamily:BF,fontSize:".88rem",color:INK2,lineHeight:1.75,
                overflow:"hidden",
                display:"-webkit-box",
                WebkitLineClamp:expanded||!isLong?999:3,
                WebkitBoxOrient:"vertical",
              }}>
                {post.content}
              </p>
              {isLong&&(
                <button
                  type="button"
                  onClick={()=>setExpanded(e=>!e)}
                  style={{background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:BF,fontSize:".80rem",fontWeight:700,color:INK3,marginTop:".25rem"}}
                >
                  {expanded?"Show less":"Read more"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Reactions */}
        <div style={{borderTop:`1px solid ${BDR}`,paddingTop:".75rem"}}>
          <ReactionBar postId={post.id} initial={post.reactions}/>
        </div>
      </div>
    </article>
  );
}

// ── Post skeleton ─────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div style={{background:W,borderRadius:24,border:`1px solid ${BDR}`,padding:"1rem 1.25rem",display:"flex",flexDirection:"column",gap:".875rem"}}>
      <div style={{display:"flex",gap:".75rem",alignItems:"center"}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:CREAM,flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{height:12,borderRadius:6,background:CREAM,width:"38%",marginBottom:6}}/>
          <div style={{height:10,borderRadius:5,background:CREAM,width:"22%"}}/>
        </div>
      </div>
      <div style={{height:10,borderRadius:5,background:CREAM,width:"90%"}}/>
      <div style={{height:10,borderRadius:5,background:CREAM,width:"70%"}}/>
      <div style={{height:10,borderRadius:5,background:CREAM,width:"80%"}}/>
    </div>
  );
}

// ── Composer ──────────────────────────────────────────────────────────────────
function Composer({weddingId,authorEmail,authorName,onPosted}:{
  weddingId:   string;
  authorEmail: string;
  authorName:  string;
  onPosted:    (p:EnrichedPost)=>void;
}) {
  const [open,       setOpen]       = useState(false);
  const [postType,   setPostType]   = useState<PostType>("memory");
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [file,       setFile]       = useState<File|null>(null);
  const [preview,    setPreview]    = useState<string|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string|null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  function pickFile(e:ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if(!f) return;
    setFile(f);
    if(preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }
  function removeFile() {
    setFile(null);
    if(preview){URL.revokeObjectURL(preview);setPreview(null);}
    if(fileRef.current) fileRef.current.value="";
  }

  function expand(){
    setOpen(true);
    setTimeout(()=>titleRef.current?.focus(),60);
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!title.trim()) return;
    setSubmitting(true); setError(null);

    try {
      let mediaUrl:string|null=null;

      if(file){
        const fd=new FormData();
        fd.append("file",file);
        fd.append("uploadedBy",authorName||authorEmail);
        fd.append("category","family-post");
        fd.append("weddingId",weddingId);
        const upRes  = await fetch("/api/upload-photo",{method:"POST",body:fd});
        const upData = await upRes.json() as {success:boolean;url?:string;message?:string};
        if(!upData.success) throw new Error(upData.message??"Photo upload failed");
        mediaUrl = upData.url??null;
      }

      const res  = await fetch("/api/family/post",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({weddingId,title:title.trim(),content:content.trim(),postType,postedBy:authorEmail,mediaUrl}),
      });
      const data = await res.json() as {success:boolean;data?:FamilyPostRow;message?:string};
      if(!data.success) throw new Error(data.message??"Failed to post");

      onPosted({...data.data!,reactions:[]});
      setTitle(""); setContent(""); removeFile(); setOpen(false);
    } catch(err){
      setError(err instanceof Error?err.message:"Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const firstName = (authorName||authorEmail).split(/[\s@]/)[0]!;

  // ── Collapsed trigger ──
  if(!open) return (
    <button
      type="button"
      onClick={expand}
      style={{
        width:"100%",padding:"1rem 1.25rem",
        display:"flex",alignItems:"center",gap:".875rem",
        background:W,border:`1px solid ${BDR}`,
        borderRadius:24,cursor:"text",textAlign:"left",
        boxShadow:"0 4px 18px rgba(26,13,10,.06)",
      }}
    >
      <Avatar name={authorName||authorEmail} size={40}/>
      <div style={{
        flex:1,padding:".75rem 1rem",borderRadius:999,
        background:BG,border:`1px solid ${CREAM}`,
        fontFamily:BF,fontSize:".9rem",color:INK3,
      }}>
        Share a memory, {firstName}…
      </div>
      <div style={{
        width:38,height:38,borderRadius:"50%",flexShrink:0,
        background:`linear-gradient(135deg,${ROSE},${ROSEL})`,
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:`0 4px 14px rgba(190,45,69,.30)`,
      }}>
        <PenLine size={16} color="#fff"/>
      </div>
    </button>
  );

  // ── Expanded form ──
  return (
    <div style={{background:W,borderRadius:24,overflow:"hidden",border:`1px solid ${BDR}`,boxShadow:"0 8px 32px rgba(26,13,10,.10)"}}>
      <div style={{height:2,background:`linear-gradient(90deg,${ROSE},${ROSEL},transparent)`}}/>
      <form onSubmit={submit} style={{padding:"1.125rem 1.25rem",display:"flex",flexDirection:"column",gap:".875rem"}}>

        {/* Header row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:".625rem"}}>
            <Avatar name={authorName||authorEmail} size={36}/>
            <p style={{fontFamily:BF,fontWeight:700,fontSize:".9rem",color:INK}}>{firstName}</p>
          </div>
          <button type="button" onClick={()=>{setOpen(false);setError(null);}}
            style={{background:"none",border:"none",cursor:"pointer",color:INK3,padding:4}}>
            <X size={16}/>
          </button>
        </div>

        {/* Type pills */}
        <div style={{display:"flex",gap:".375rem",flexWrap:"wrap"}}>
          {POST_TYPES.map(t=>{
            const m=PT_META[t];
            return (
              <button key={t} type="button" onClick={()=>setPostType(t)} style={{
                display:"inline-flex",alignItems:"center",gap:5,
                padding:"5px 12px",borderRadius:999,cursor:"pointer",
                fontFamily:BF,fontSize:".60rem",fontWeight:700,
                letterSpacing:".12em",textTransform:"uppercase",
                background:postType===t?ROSE:BG,
                border:`1px solid ${postType===t?ROSE:CREAM}`,
                color:postType===t?W:INK3,
                transition:"all .15s",
              }}>{m.emoji} {m.label}</button>
            );
          })}
        </div>

        {/* Photo preview */}
        {preview&&(
          <div style={{position:"relative",borderRadius:16,overflow:"hidden",aspectRatio:"16/9"}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            <button type="button" onClick={removeFile} style={{
              position:"absolute",top:8,right:8,
              width:28,height:28,borderRadius:"50%",
              background:"rgba(0,0,0,.55)",border:"none",cursor:"pointer",
              display:"grid",placeItems:"center",color:"#fff",
            }}><X size={13}/></button>
          </div>
        )}

        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          required
          maxLength={120}
          placeholder="Give it a title…"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          style={{
            width:"100%",padding:".75rem 1rem",borderRadius:14,
            border:`1.5px solid ${CREAM}`,background:BG,
            fontFamily:DF,fontSize:"1.1rem",color:INK,outline:"none",
          }}
        />

        {/* Content */}
        <textarea
          maxLength={2000}
          rows={3}
          placeholder="Write something for the family archive…"
          value={content}
          onChange={e=>setContent(e.target.value)}
          style={{
            width:"100%",padding:".75rem 1rem",borderRadius:14,
            border:`1.5px solid ${CREAM}`,background:BG,
            fontFamily:BF,fontSize:".9rem",color:INK,lineHeight:1.7,
            resize:"none",outline:"none",
          }}
        />

        {error&&(
          <p style={{padding:".75rem 1rem",borderRadius:12,background:"rgba(190,45,69,.06)",border:`1px solid rgba(190,45,69,.18)`,fontFamily:BF,fontSize:".84rem",color:ROSE}}>
            {error}
          </p>
        )}

        {/* Toolbar + submit */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:".5rem"}}>
          <div style={{display:"flex",gap:".375rem"}}>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={pickFile}/>
            <button
              type="button"
              onClick={()=>fileRef.current?.click()}
              title="Attach photo"
              style={{
                width:36,height:36,borderRadius:"50%",cursor:"pointer",
                background:"rgba(190,45,69,.07)",border:`1px solid rgba(190,45,69,.14)`,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:ROSE,transition:"background .15s",
              }}
            ><Camera size={15}/></button>
          </div>

          <div style={{display:"flex",gap:".5rem"}}>
            <button type="button" onClick={()=>{setOpen(false);setError(null);}} style={{
              padding:"9px 18px",borderRadius:999,cursor:"pointer",
              background:"none",border:`1.5px solid ${CREAM}`,
              fontFamily:BF,fontSize:".65rem",fontWeight:700,
              letterSpacing:".12em",textTransform:"uppercase",color:INK3,
            }}>Cancel</button>

            <button type="submit" disabled={submitting||!title.trim()} style={{
              display:"inline-flex",alignItems:"center",gap:6,
              padding:"9px 20px",borderRadius:999,cursor:"pointer",
              background:ROSE,border:`1px solid ${ROSE}`,
              fontFamily:BF,fontSize:".65rem",fontWeight:700,
              letterSpacing:".12em",textTransform:"uppercase",color:W,
              boxShadow:`0 4px 16px rgba(190,45,69,.28)`,
              opacity:submitting||!title.trim() ? .55 : 1,
              transition:"opacity .15s",
            }}>
              {submitting?<Loader2 size={14} style={{animation:"spin .9s linear infinite"}}/>:<Send size={14}/>}
              {submitting?"Sharing…":"Share"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export function FamilyFeed({initialPosts,weddingId,authorEmail,authorName}:FamilyFeedProps) {
  const [posts,   setPosts]   = useState<EnrichedPost[]>(initialPosts.map(p=>({...p,reactions:[]})));
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>|null>(null);

  // Refresh feed every 30s
  const refresh = useCallback(async()=>{
    try{
      const res  = await fetch(`/api/family/feed?weddingId=${weddingId}`,{cache:"no-store"});
      if(!res.ok) return;
      const data = await res.json() as {success:boolean;data?:EnrichedPost[]};
      if(data.success&&data.data) setPosts(data.data);
    }catch{/**/}
  },[weddingId]);

  useEffect(()=>{
    pollRef.current = setInterval(()=>void refresh(), 30_000);
    return ()=>{ if(pollRef.current) clearInterval(pollRef.current); };
  },[refresh]);

  function onPosted(post:EnrichedPost){ setPosts(prev=>[post,...prev]); }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.125rem"}}>
      <Composer
        weddingId={weddingId}
        authorEmail={authorEmail}
        authorName={authorName}
        onPosted={onPosted}
      />

      {loading?(
        <>
          <PostSkeleton/><PostSkeleton/><PostSkeleton/>
        </>
      ):posts.length===0?(
        <div style={{
          padding:"3rem 1.5rem",textAlign:"center",
          background:W,borderRadius:24,
          border:`1.5px dashed ${CREAM}`,
        }}>
          <div style={{width:56,height:56,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",background:"rgba(190,45,69,.07)",color:ROSE}}>
            <Sparkles size={24}/>
          </div>
          <h3 style={{fontFamily:DF,fontSize:"1.7rem",color:INK,marginBottom:".5rem"}}>
            Be the first to share a memory
          </h3>
          <p style={{fontFamily:BF,fontSize:".9rem",color:INK3,lineHeight:1.7,maxWidth:360,margin:"0 auto"}}>
            Family stories, blessings, and milestones will appear here. Share something above.
          </p>
        </div>
      ):(
        posts.map(post=><PostCard key={post.id} post={post}/>)
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default FamilyFeed;
