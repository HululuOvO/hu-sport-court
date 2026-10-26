// Adapted from React Bits ScrollExpand's progress-driven frame geometry.
// HU already supplies a shared scroll rail: inherit its progress instead of nesting another scroller.
export default function ScrollExpand({children}) {
  return <div className="hu-scroll-expand">{children}</div>;
}
