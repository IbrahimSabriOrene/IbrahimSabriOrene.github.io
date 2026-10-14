import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function LoadingBar() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);
    const t1 = setTimeout(() => setProgress(70), 80);
    const t2 = setTimeout(() => setProgress(100), 200);
    const t3 = setTimeout(() => { setLoading(false); setProgress(0); }, 350);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-px">
      <div className="h-full bg-electric transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
    </div>
  );
}
