import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceArea
} from "recharts";
import {
  BDA_REPS, SBC_REPS, BDA_KNOWN_REPS, SBC_KNOWN_REPS,
  BDA_ACTIVE, BDA_INACTIVE, SBC_ACTIVE, SBC_INACTIVE,
  BDA_DATE_PC, BDA_DATE_RPR, BDA_DATE_CCOST,
  BDA_MONTH_PC, BDA_MONTH_RPR, BDA_MONTH_CCOST,
  SBC_DATE_PC, SBC_DATE_RPR, SBC_DATE_CCOST,
  SBC_MONTH_PC, SBC_MONTH_RPR, SBC_MONTH_CCOST,
} from "./data.js";

const PASSWORD = "john2026";

const BDA_COLORS = ["#2196F3","#4CAF50","#FF9800","#E91E63","#9C27B0","#00BCD4","#FF5722","#8BC34A","#FFC107","#607D8B","#F44336","#3F51B5","#009688","#CDDC39","#FF4081","#00E5FF","#76FF03","#FF6D00","#D500F9","#00B0FF","#64FFDA","#EEFF41","#FF6E40","#40C4FF","#EA80FC","#A7FFEB","#FFD740","#FF6D00","#69F0AE","#B0BEC5","#EF9A9A","#CE93D8","#80CBC4","#A5D6A7","#FFE082","#90CAF9"];
const SBC_COLORS = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9"];

const lastName = name => name.split(" ").slice(-1)[0];
const fmt$  = v => v == null ? "—" : `$${v >= 0 ? "" : "-"}${Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtPC = v => v == null ? "—" : v.toFixed(2) + "x";

const CustomTooltip = ({ active, payload, label, xAxis }) => {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].filter(p => p.value != null).sort((a, b) => b.value - a.value);
  return (
    <div style={{ background:"#0f1f3d", border:"1px solid #1e3a6e", borderRadius:6, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:"#aaa", marginBottom:6, fontWeight:600 }}>{xAxis === "date" ? label : `Month ${label}`}</div>
      {sorted.map(p => (
        <div key={p.dataKey} style={{ color:p.color, display:"flex", justifyContent:"space-between", gap:20, marginBottom:2 }}>
          <span>{p.dataKey}</span>
          <span style={{ fontWeight:700 }}>{fmtPC(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

function PasswordGate({ children }) {
  const [input, setInput]     = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError]     = useState(false);
  const attempt = () => {
    if (input === PASSWORD) { setUnlocked(true); setError(false); }
    else { setError(true); setInput(""); }
  };
  if (unlocked) return children;
  return (
    <div style={{ background:"#0a0f1e", minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", fontFamily:"Calibri, sans-serif" }}>
      <h1 style={{ color:"#fff", fontSize:26, fontWeight:700, letterSpacing:1, marginBottom:8 }}>GROSS PAYBACK</h1>
      <p style={{ color:"#888", fontSize:13, marginBottom:32 }}>Enter password to continue</p>
      <div style={{ display:"flex", gap:8 }}>
        <input type="password" value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="Password"
          style={{ padding:"10px 16px", borderRadius:4, border: error ? "1px solid #E91E63" : "1px solid #1e2d4a",
            background:"#111827", color:"#fff", fontSize:14, outline:"none", width:200 }} />
        <button onClick={attempt} style={{ padding:"10px 20px", borderRadius:4, border:"none",
          background:"#2196F3", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>Enter</button>
      </div>
      {error && <p style={{ color:"#E91E63", fontSize:12, marginTop:12 }}>Incorrect password</p>}
    </div>
  );
}

export default function App() {
  const [universe,   setUniverse]   = useState("bda");
  const [xAxis,      setXAxis]      = useState("date");
  const [aiFilter,   setAiFilter]   = useState("all");
  const [activeReps, setActiveReps] = useState(new Set(BDA_REPS));
  const [dateStart,  setDateStart]  = useState(null);
  const [dateEnd,    setDateEnd]    = useState(null);

  useEffect(() => {
    const active   = universe === "bda" ? BDA_ACTIVE   : SBC_ACTIVE;
    const inactive = universe === "bda" ? BDA_INACTIVE : SBC_INACTIVE;
    const all      = universe === "bda" ? BDA_REPS     : SBC_REPS;
    const pool = aiFilter === "active" ? active : aiFilter === "inactive" ? inactive : all;
    setActiveReps(new Set(pool));
    setDateStart(null);
    setDateEnd(null);
  }, [universe, aiFilter]);

  const allReps      = universe === "bda" ? BDA_REPS      : SBC_REPS;
  const knownReps    = universe === "bda" ? BDA_KNOWN_REPS: SBC_KNOWN_REPS;
  const activeList   = universe === "bda" ? BDA_ACTIVE    : SBC_ACTIVE;
  const inactiveList = universe === "bda" ? BDA_INACTIVE  : SBC_INACTIVE;
  const repPool      = aiFilter === "active" ? activeList : aiFilter === "inactive" ? inactiveList : allReps;
  const tenurePool   = repPool.filter(r => knownReps.includes(r));
  const currentPool  = xAxis === "month" ? tenurePool : repPool;

  const colors   = universe === "bda" ? BDA_COLORS : SBC_COLORS;
  const colorMap = Object.fromEntries(allReps.map((r, i) => [r, colors[i % colors.length]]));

  const rawPC = useMemo(() => {
    if (universe === "bda" && xAxis === "date")  return BDA_DATE_PC;
    if (universe === "bda" && xAxis === "month") return BDA_MONTH_PC;
    if (universe === "sbc" && xAxis === "date")  return SBC_DATE_PC;
    return SBC_MONTH_PC;
  }, [universe, xAxis]);

  const rawRPr = useMemo(() => {
    if (universe === "bda" && xAxis === "date")  return BDA_DATE_RPR;
    if (universe === "bda" && xAxis === "month") return BDA_MONTH_RPR;
    if (universe === "sbc" && xAxis === "date")  return SBC_DATE_RPR;
    return SBC_MONTH_RPR;
  }, [universe, xAxis]);

  const rawCCost = useMemo(() => {
    if (universe === "bda" && xAxis === "date")  return BDA_DATE_CCOST;
    if (universe === "bda" && xAxis === "month") return BDA_MONTH_CCOST;
    if (universe === "sbc" && xAxis === "date")  return SBC_DATE_CCOST;
    return SBC_MONTH_CCOST;
  }, [universe, xAxis]);

  const xKey = xAxis === "date" ? "date" : "month";

  const allDates = useMemo(() => rawPC.map(d => d.date).filter(Boolean), [rawPC]);

  const pcData = useMemo(() => {
    let arr = [...rawPC];
    if (xAxis === "date" && (dateStart || dateEnd)) {
      const dates = arr.map(d => d.date);
      const si = dateStart ? dates.indexOf(dateStart) : 0;
      const ei = dateEnd   ? dates.indexOf(dateEnd)   : dates.length - 1;
      arr = arr.slice(si < 0 ? 0 : si, ei < 0 ? arr.length : ei + 1);
    }
    while (arr.length > 0) {
      const last = arr[arr.length - 1];
      const hasValue = currentPool.some(r => activeReps.has(r) && last[r] != null);
      if (hasValue) break;
      arr.pop();
    }
    return arr;
  }, [rawPC, activeReps, currentPool, xAxis, dateStart, dateEnd]);

  const ticks = useMemo(() => {
    if (xAxis === "date") return pcData.filter((_, i) => i % 4 === 0).map(d => d.date);
    return pcData.map(d => d.month);
  }, [pcData, xAxis]);

  const lastIndexMap = useMemo(() => {
    const map = {};
    currentPool.forEach(rep => {
      let last = -1;
      pcData.forEach((row, i) => { if (row[rep] != null) last = i; });
      map[rep] = last;
    });
    return map;
  }, [pcData, currentPool]);

  const makeEndDot = (rep, color) => (props) => {
    const { cx, cy, index } = props;
    if (index !== lastIndexMap[rep]) return <g key={`e-${rep}-${index}`} />;
    const val = pcData[index]?.[rep];
    if (val == null) return <g />;
    const label = `${lastName(rep)} ${fmtPC(val)}`;
    return (
      <g key={`end-${rep}`}>
        <circle cx={cx} cy={cy} r={3} fill={color} />
        <text x={cx + 7} y={cy - 5} fill={color} fontSize={10} fontWeight={700}
          style={{ textShadow:"0 0 6px #0a0f1e, 0 0 6px #0a0f1e" }}>
          {label}
        </text>
      </g>
    );
  };

  const toggle    = rep => setActiveReps(prev => { const n = new Set(prev); n.has(rep) ? n.delete(rep) : n.add(rep); return n; });
  const selectAll = () => setActiveReps(new Set(currentPool));
  const clearAll  = () => setActiveReps(new Set());

  const yFmt = v => `${v.toFixed(1)}x`;

  const btnBase = { padding:"6px 14px", borderRadius:4, border:"none", cursor:"pointer", fontSize:12, fontWeight:600 };
  const btn     = on => ({ ...btnBase, background: on ? "#2196F3" : "#1e2d4a", color: on ? "#fff" : "#aaa" });
  const divider = { paddingRight:12, borderRight:"1px solid #1e2d4a", marginRight:4, display:"flex", gap:4 };

  const selectedReps = currentPool.filter(r => activeReps.has(r));

  // Build table data: merge RPr and C.Cost per rep per period
  const tableRPr   = useMemo(() => {
    let arr = [...rawRPr];
    if (xAxis === "date" && (dateStart || dateEnd)) {
      const dates = arr.map(d => d.date);
      const si = dateStart ? dates.indexOf(dateStart) : 0;
      const ei = dateEnd   ? dates.indexOf(dateEnd)   : dates.length - 1;
      arr = arr.slice(si < 0 ? 0 : si, ei < 0 ? arr.length : ei + 1);
    }
    return arr.slice(0, pcData.length);
  }, [rawRPr, pcData, xAxis, dateStart, dateEnd]);

  const tableCCost = useMemo(() => {
    let arr = [...rawCCost];
    if (xAxis === "date" && (dateStart || dateEnd)) {
      const dates = arr.map(d => d.date);
      const si = dateStart ? dates.indexOf(dateStart) : 0;
      const ei = dateEnd   ? dates.indexOf(dateEnd)   : dates.length - 1;
      arr = arr.slice(si < 0 ? 0 : si, ei < 0 ? arr.length : ei + 1);
    }
    return arr.slice(0, pcData.length);
  }, [rawCCost, pcData, xAxis, dateStart, dateEnd]);

  return (
    <PasswordGate>
      <div style={{ background:"#0a0f1e", minHeight:"100vh", width:"100%", boxSizing:"border-box",
        padding:"20px 24px", fontFamily:"Calibri, sans-serif", color:"#fff", overflowX:"hidden" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"baseline", gap:16, marginBottom:4 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, letterSpacing:0.5 }}>GROSS PAYBACK</h1>
          <span style={{ color:"#888", fontSize:13 }}>
            {universe.toUpperCase()} · {aiFilter === "all" ? "All" : aiFilter.charAt(0).toUpperCase()+aiFilter.slice(1)}
            {" — "}{xAxis === "date" ? `${dateStart || "Jan-22"} → ${dateEnd || "Present"}` : "First 24 Months"}
            <span style={{ color:"#555", marginLeft:12 }}>Gross · Direct costs only (salary + commissions + tax)</span>
          </span>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", gap:8, marginBottom:20, marginTop:12, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{...divider}}>
            {["bda","sbc"].map(u => (
              <button key={u} onClick={() => setUniverse(u)}
                style={{...btn(universe===u), textTransform:"uppercase", letterSpacing:1}}>{u}</button>
            ))}
          </div>
          <div style={{...divider}}>
            {[["all","All"],["active","Active"],["inactive","Inactive"]].map(([val, label]) => (
              <button key={val} onClick={() => setAiFilter(val)} style={{...btn(aiFilter===val)}}>{label}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4 }}>
            <button onClick={() => setXAxis("date")}  style={{...btn(xAxis==="date")}}>Calendar Date</button>
            <button onClick={() => setXAxis("month")} style={{...btn(xAxis==="month")}}>First 24 Months</button>
          </div>
          {xAxis === "date" && (
            <div style={{ display:"flex", gap:8, alignItems:"center", marginLeft:4 }}>
              <span style={{ color:"#555", fontSize:11 }}>From</span>
              <select value={dateStart || ""} onChange={e => setDateStart(e.target.value || null)}
                style={{ background:"#1e2d4a", color:"#aaa", border:"1px solid #2a3a5a",
                  borderRadius:4, padding:"5px 8px", fontSize:12, cursor:"pointer", outline:"none" }}>
                <option value="">Start</option>
                {allDates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span style={{ color:"#555", fontSize:11 }}>To</span>
              <select value={dateEnd || ""} onChange={e => setDateEnd(e.target.value || null)}
                style={{ background:"#1e2d4a", color:"#aaa", border:"1px solid #2a3a5a",
                  borderRadius:4, padding:"5px 8px", fontSize:12, cursor:"pointer", outline:"none" }}>
                <option value="">End</option>
                {allDates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {(dateStart || dateEnd) && (
                <button onClick={() => { setDateStart(null); setDateEnd(null); }}
                  style={{ padding:"4px 10px", fontSize:11, borderRadius:4, border:"1px solid #555",
                    background:"transparent", color:"#888", cursor:"pointer" }}>Reset</button>
              )}
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ background:"#111827", borderRadius:8, padding:"16px 8px 8px", marginBottom:20 }}>
          <div style={{ color:"#aaa", fontSize:11, paddingLeft:16, marginBottom:8 }}>
            P+/-C = RPr ÷ |Total Direct Cost|. &nbsp;
            <span style={{ color:"#4CAF50" }}>Above 1.0x = cost recovered (payback zone)</span>
            &nbsp;·&nbsp;
            <span style={{ color:"#E91E63" }}>Below 1.0x = underwater</span>
          </div>
          <ResponsiveContainer width="100%" height={440}>
            <LineChart data={pcData} margin={{ top:8, right:150, left:10, bottom:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              {/* Zone tints */}
              <ReferenceArea y1={1.0} y2={20}  fill="#4CAF50" fillOpacity={0.05} />
              <ReferenceArea y1={-20} y2={1.0} fill="#E91E63" fillOpacity={0.04} />
              <XAxis dataKey={xKey} ticks={ticks} tick={{ fill:"#666", fontSize:11 }}
                axisLine={{ stroke:"#1e2d4a" }} tickLine={false}
                tickFormatter={v => xAxis === "month" ? `M${v}` : v} />
              <YAxis tickFormatter={yFmt} tick={{ fill:"#666", fontSize:11 }}
                axisLine={{ stroke:"#1e2d4a" }} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip xAxis={xAxis} />} />
              {/* Breakeven line — label above */}
              <ReferenceLine y={1.0} stroke="#FFD700" strokeWidth={1.5} strokeDasharray="5 3"
                label={{ value:"Breakeven 1.0x", fill:"#FFD700", fontSize:10, position:"insideTopLeft" }} />
              <ReferenceLine y={0} stroke="#333" strokeDasharray="3 3" />
              {currentPool.map(rep => activeReps.has(rep) && (
                <Line key={rep} type="monotone" dataKey={rep} stroke={colorMap[rep]}
                  strokeWidth={2} dot={makeEndDot(rep, colorMap[rep])} connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rep chips */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", marginBottom:24 }}>
          <button onClick={selectAll} style={{ padding:"4px 10px", fontSize:11, borderRadius:4,
            border:"1px solid #2196F3", background:"transparent", color:"#2196F3", cursor:"pointer" }}>All</button>
          <button onClick={clearAll} style={{ padding:"4px 10px", fontSize:11, borderRadius:4,
            border:"1px solid #555", background:"transparent", color:"#888", cursor:"pointer" }}>None</button>
          {currentPool.map(rep => {
            const on = activeReps.has(rep);
            const c  = colorMap[rep];
            const latestPC = [...pcData].reverse().find(row => row[rep] != null)?.[rep];
            return (
              <button key={rep} onClick={() => toggle(rep)} style={{
                padding:"4px 12px", borderRadius:4, border:`1px solid ${c}`,
                background: on ? c+"22" : "transparent",
                color: on ? c : "#555", cursor:"pointer", fontSize:12, fontWeight:600,
                display:"flex", alignItems:"center", gap:6,
              }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background: on ? c : "#333", display:"inline-block" }} />
                {rep}
                <span style={{ fontSize:10, color: on ? c : "#444" }}>{fmtPC(latestPC)}</span>
              </button>
            );
          })}
        </div>

        {/* Horizontal table — RPr and C.Cost per period */}
        {selectedReps.length > 0 && (
          <div style={{ background:"#111827", borderRadius:8, overflow:"hidden", marginBottom:20 }}>
            <div style={{ padding:"10px 16px", borderBottom:"1px solid #1e2d4a", fontSize:12, color:"#aaa", fontWeight:600 }}>
              RPr & C.Cost by {xAxis === "month" ? "Tenure Month" : "Calendar Period"} — Selected Reps
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ borderCollapse:"collapse", fontSize:12, whiteSpace:"nowrap", minWidth:"100%" }}>
                <thead>
                  <tr style={{ background:"#0f1f3d" }}>
                    <th style={{ textAlign:"left", padding:"7px 14px", color:"#aaa", fontWeight:600,
                      position:"sticky", left:0, background:"#0f1f3d", zIndex:2,
                      borderRight:"1px solid #1e2d4a", minWidth:180 }}>Rep</th>
                    <th style={{ textAlign:"left", padding:"7px 10px", color:"#607D8B", fontWeight:600,
                      position:"sticky", left:180, background:"#0f1f3d", zIndex:2,
                      borderRight:"1px solid #1e2d4a", minWidth:70 }}>Figure</th>
                    {pcData.map(row => (
                      <th key={row[xKey]} style={{ textAlign:"right", padding:"7px 12px",
                        color:"#555", fontWeight:500, minWidth:88 }}>
                        {xAxis === "month" ? `M${row[xKey]}` : row[xKey]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedReps.map((rep, i) => {
                    const c   = colorMap[rep];
                    const bg0 = i % 2 === 0 ? "#111827" : "#0d1829";
                    return (
                      <>
                        {/* RPr row */}
                        <tr key={`${rep}-rpr`} style={{ borderTop:"1px solid #1e2d4a", background: bg0 }}>
                          <td style={{ padding:"7px 14px", position:"sticky", left:0, zIndex:1,
                            background: bg0, borderRight:"1px solid #1e2d4a",
                            display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ width:7, height:7, borderRadius:"50%", background:c,
                              display:"inline-block", flexShrink:0 }} />
                            <span style={{ color:c, fontWeight:600 }}>{rep}</span>
                          </td>
                          <td style={{ padding:"7px 10px", position:"sticky", left:180, zIndex:1,
                            background: bg0, borderRight:"1px solid #1e2d4a",
                            color:"#4CAF50", fontSize:11, fontWeight:600 }}>RPr</td>
                          {tableRPr.map(row => {
                            const val = row[rep];
                            const isPos = val != null && val >= 0;
                            return (
                              <td key={row[xKey]} style={{ padding:"7px 12px", textAlign:"right",
                                fontWeight: val != null ? 600 : 400,
                                color: val == null ? "#2a3a55" : isPos ? "#4CAF50" : "#E91E63" }}>
                                {val == null ? "—" : fmt$(val)}
                              </td>
                            );
                          })}
                        </tr>
                        {/* C.Cost row */}
                        <tr key={`${rep}-ccost`} style={{ background: bg0 }}>
                          <td style={{ padding:"7px 14px", position:"sticky", left:0, zIndex:1,
                            background: bg0, borderRight:"1px solid #1e2d4a" }} />
                          <td style={{ padding:"7px 10px", position:"sticky", left:180, zIndex:1,
                            background: bg0, borderRight:"1px solid #1e2d4a",
                            color:"#E91E63", fontSize:11, fontWeight:600 }}>C.Cost</td>
                          {tableCCost.map(row => {
                            const val = row[rep];
                            return (
                              <td key={row[xKey]} style={{ padding:"7px 12px", textAlign:"right",
                                fontWeight: val != null ? 500 : 400,
                                color: val == null ? "#2a3a55" : "#E91E63" }}>
                                {val == null ? "—" : fmt$(val)}
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </PasswordGate>
  );
}
