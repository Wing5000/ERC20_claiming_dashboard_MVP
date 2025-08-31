import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setLeaders(data);
        } else if (data && Array.isArray(data.leaders) && data.leaders.length > 0) {
          setLeaders(data.leaders);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const localCount = parseInt(localStorage.getItem("ref.invites") || "0", 10);

  if (leaders) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Top referrers</h3>
        <ol className="space-y-1 text-sm text-zinc-300">
          {leaders.map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span className="mr-2">
                {idx + 1}. {item.name || item.address}
              </span>
              <span>{item.count}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
      <div className="mb-2 font-semibold text-white">Your invites</div>
      <div>
        You have invited {localCount} {localCount === 1 ? "friend" : "friends"}.
      </div>
    </div>
  );
}
