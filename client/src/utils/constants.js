export const TARGETS = {
  easy: [
    { name: "Basic_Circle", styles: { width: "200px", height: "200px", backgroundColor: "rgb(16, 185, 129)", borderRadius: "50%" } },
    { name: "Basic_Square", styles: { width: "180px", height: "180px", backgroundColor: "rgb(5, 150, 105)" } },
    { name: "Mint_Rectangle", styles: { width: "250px", height: "120px", backgroundColor: "rgb(52, 211, 153)", borderRadius: "8px" } },
    { name: "Sky_Pill", styles: { width: "220px", height: "60px", backgroundColor: "rgb(14, 165, 233)", borderRadius: "30px" } },
    { name: "Deep_Forest", styles: { width: "150px", height: "150px", backgroundColor: "rgb(6, 78, 59)", borderRadius: "20px" } },
    { name: "Candy_Bar", styles: { width: "200px", height: "40px", backgroundColor: "rgb(236, 72, 153)", borderRadius: "4px" } }
  ],
  medium: [
    { name: "Pill_Badge", styles: { width: "240px", height: "80px", backgroundColor: "rgb(6, 78, 59)", borderRadius: "40px", border: "2px dashed rgb(52, 211, 153)" } },
    { name: "Shadow_Box", styles: { width: "160px", height: "160px", backgroundColor: "rgb(16, 185, 129)", boxShadow: "15px 15px 0px rgb(6, 78, 59)", borderRadius: "12px" } },
    { name: "Leaf_Shape", styles: { width: "180px", height: "180px", backgroundColor: "rgb(5, 150, 105)", borderRadius: "0 100% 0 100%" } },
    { name: "Hollow_Emerald", styles: { width: "150px", height: "150px", backgroundColor: "transparent", border: "10px solid rgb(16, 185, 129)", borderRadius: "50%" } },
    { name: "Soft_Incline", styles: { width: "200px", height: "120px", backgroundColor: "rgb(20, 184, 166)", borderRadius: "30px 0 30px 0" } },
    { name: "Notification_Dot", styles: { width: "80px", height: "80px", backgroundColor: "rgb(244, 63, 94)", borderRadius: "50%", border: "8px solid rgb(255, 255, 255)" } }
  ],
  hard: [
    { name: "Cyber_Hex", styles: { width: "160px", height: "160px", backgroundColor: "rgb(16, 185, 129)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" } },
    { name: "Neon_Ghost", styles: { width: "180px", height: "180px", backgroundColor: "transparent", border: "4px solid rgb(16, 185, 129)", borderRadius: "12px", boxShadow: "0 0 20px rgb(16, 185, 129), inset 0 0 20px rgb(16, 185, 129)" } },
    { name: "Glass_Uplink", styles: { width: "220px", height: "140px", backgroundColor: "rgba(16, 185, 129, 0.1)", backdropFilter: "blur(12px)", borderRadius: "20px", border: "2px solid rgba(16, 185, 129, 0.3)" } },
    { name: "Diamond_Core", styles: { width: "150px", height: "150px", backgroundColor: "rgb(99, 102, 241)", transform: "rotate(45deg)", borderRadius: "12px" } },
    { name: "Bio_Blade", styles: { width: "240px", height: "40px", backgroundColor: "rgb(16, 185, 129)", borderRadius: "100% 0 100% 0", borderLeft: "20px solid rgb(6, 78, 59)" } },
    { name: "Sunburst_Disk", styles: { width: "180px", height: "180px", backgroundColor: "rgb(245, 158, 11)", borderRadius: "50%", border: "5px dashed rgb(255, 255, 255)", outline: "10px solid rgb(245, 158, 11)" } }
  ],
  impossible: [
    { name: "Floating_Core", styles: { width: "120px", height: "120px", backgroundColor: "rgb(16, 185, 129)", borderRadius: "50%", boxShadow: "0 0 40px rgb(16, 185, 129), 0 0 0 20px rgba(16, 185, 129, 0.1), 0 0 0 40px rgba(16, 185, 129, 0.05)" } },
    { name: "Double_Blade", styles: { width: "200px", height: "200px", backgroundColor: "rgb(6, 78, 59)", borderRadius: "50% 0 50% 0", border: "10px double rgb(52, 211, 153)", transform: "rotate(45deg)" } },
    { name: "Toxic_Sun", styles: { width: "150px", height: "150px", backgroundColor: "rgb(245, 158, 11)", borderRadius: "50%", border: "10px solid rgb(217, 119, 6)", boxShadow: "0 0 50px rgb(245, 158, 11), inset 0 0 30px rgb(217, 119, 6)" } },
    { name: "Cyber_Shield", styles: { width: "180px", height: "220px", backgroundColor: "rgb(16, 185, 129)", clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)", borderTop: "20px solid rgb(6, 78, 59)" } },
    { name: "Prism_Cell", styles: { width: "160px", height: "160px", backgroundColor: "rgba(16, 185, 129, 0.5)", border: "2px solid rgb(255, 255, 255)", borderRadius: "50%", boxShadow: "inset 0 0 50px rgb(255, 255, 255), 0 0 20px rgb(16, 185, 129)" } },
    { name: "Neural_Link", styles: { width: "280px", height: "20px", backgroundColor: "rgb(16, 185, 129)", borderRadius: "10px", boxShadow: "0 40px 0 rgb(16, 185, 129), 0 -40px 0 rgb(16, 185, 129)", transform: "skewX(-20deg)" } }
  ]
};

export const RANKS = [
  { name: "Novice_Stylist", minXP: 0, color: "text-emerald-500/60", theme: "emerald" },
  { name: "Grid_Initiate", minXP: 500, color: "text-emerald-400", theme: "emerald" },
  { name: "Flexbox_Phantom", minXP: 1200, color: "text-teal-400", theme: "teal" },
  { name: "Z_Index_Master", minXP: 2500, color: "text-indigo-400", theme: "indigo" },
  { name: "Style_Architect", minXP: 5000, color: "text-purple-400", theme: "purple" },
  { name: "CSS_Deity", minXP: 10000, color: "text-amber-400 animate-pulse", theme: "amber" }
];

export const THEMES = {
  emerald: { primary: "emerald-500", secondary: "emerald-900", glow: "rgba(16, 185, 129, 0.5)" },
  teal: { primary: "teal-500", secondary: "teal-900", glow: "rgba(20, 184, 166, 0.5)" },
  indigo: { primary: "indigo-500", secondary: "indigo-900", glow: "rgba(99, 102, 241, 0.5)" },
  purple: { primary: "purple-500", secondary: "purple-900", glow: "rgba(168, 85, 247, 0.5)" },
  amber: { primary: "amber-500", secondary: "amber-900", glow: "rgba(245, 158, 11, 0.5)" }
};

export function getRank(xp) {
  return [...RANKS].reverse().find(r => xp >= r.minXP) || RANKS[0];
}

export function getDailyTarget() {
  const day = new Date().getUTCDate();
  const allTargets = [...TARGETS.easy, ...TARGETS.medium, ...TARGETS.hard, ...TARGETS.impossible];
  const index = day % allTargets.length;
  return { ...allTargets[index], isDaily: true };
}
