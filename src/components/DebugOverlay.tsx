import { useEffect, useState } from 'react';

type OverlayInfo = {
  element: Element;
  zIndex: string;
  pointerEvents: string;
  display: string;
  opacity: string;
  position: string;
};

export function DebugOverlay() {
  const [overlays, setOverlays] = useState<OverlayInfo[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const checkOverlays = () => {
      const elements = document.querySelectorAll('[class*="modal"], [class*="overlay"], [class*="banner"], [class*="toast"], [class*="message"]');
      const overlayInfo: OverlayInfo[] = [];

      elements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        const zIndex = styles.zIndex;
        const pointerEvents = styles.pointerEvents;
        const display = styles.display;
        const opacity = styles.opacity;
        const position = styles.position;

        if (position === 'fixed' || position === 'absolute') {
          overlayInfo.push({
            element: el,
            zIndex,
            pointerEvents,
            display,
            opacity,
            position,
          });

          if (display !== 'none' && opacity !== '0' && pointerEvents !== 'none') {
            const visibleTime = (el as HTMLElement).dataset.visibleSince;
            const now = Date.now();

            if (visibleTime) {
              const duration = now - parseInt(visibleTime);
              if (duration > 10000) {
                console.warn(
                  `⚠️ Overlay visible for more than 10s:`,
                  el.className,
                  `Duration: ${Math.round(duration / 1000)}s`,
                  `z-index: ${zIndex}`,
                  `pointer-events: ${pointerEvents}`
                );
              }
            } else {
              (el as HTMLElement).dataset.visibleSince = now.toString();
            }
          } else {
            delete (el as HTMLElement).dataset.visibleSince;
          }
        }
      });

      setOverlays(overlayInfo);
    };

    const interval = setInterval(checkOverlays, 2000);
    checkOverlays();

    return () => clearInterval(interval);
  }, []);

  if (!import.meta.env.DEV) return null;

  const visibleOverlays = overlays.filter(
    o => o.display !== 'none' && o.opacity !== '0' && o.pointerEvents !== 'none'
  );

  return (
    <>
      <button
        onClick={() => setVisible(!visible)}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          background: visibleOverlays.length > 0 ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          pointerEvents: 'auto',
        }}
      >
        🐛 Overlays: {visibleOverlays.length}
      </button>

      {visible && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            right: '16px',
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            border: '2px solid #8b5cf6',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '12px',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
            pointerEvents: 'auto',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#8b5cf6' }}>Debug Overlay Info</h3>
          <p style={{ marginBottom: '12px', color: '#9ca3af' }}>
            Tracking positioned elements in the DOM
          </p>

          {overlays.length === 0 ? (
            <p>No overlays detected</p>
          ) : (
            <>
              <h4 style={{ color: '#10b981', marginTop: 0 }}>
                ✅ Visible Overlays ({visibleOverlays.length})
              </h4>
              {visibleOverlays.map((overlay, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    border: '1px solid #ef4444',
                  }}
                >
                  <div><strong>Class:</strong> {overlay.element.className || 'none'}</div>
                  <div><strong>z-index:</strong> {overlay.zIndex}</div>
                  <div><strong>pointer-events:</strong> {overlay.pointerEvents}</div>
                  <div><strong>display:</strong> {overlay.display}</div>
                  <div><strong>opacity:</strong> {overlay.opacity}</div>
                  <div><strong>position:</strong> {overlay.position}</div>
                </div>
              ))}

              <h4 style={{ color: '#6b7280', marginTop: '16px' }}>
                Hidden Overlays ({overlays.length - visibleOverlays.length})
              </h4>
              {overlays
                .filter(o => o.display === 'none' || o.opacity === '0' || o.pointerEvents === 'none')
                .map((overlay, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(107, 114, 128, 0.2)',
                      padding: '8px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '1px solid #6b7280',
                    }}
                  >
                    <div><strong>Class:</strong> {overlay.element.className || 'none'}</div>
                    <div><strong>z-index:</strong> {overlay.zIndex}</div>
                    <div><strong>pointer-events:</strong> {overlay.pointerEvents}</div>
                  </div>
                ))}
            </>
          )}
        </div>
      )}
    </>
  );
}
