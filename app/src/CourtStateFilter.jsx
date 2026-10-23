import { useEffect, useId, useRef, useState } from "react";
import { Bell, CaretDown, Check, CheckCircle, Clock, Scales, SquaresFour } from "@phosphor-icons/react";

const options = [
  { value: "all", label: "全部法庭", Icon: SquaresFour },
  { value: "open", label: "开庭中", Icon: Scales },
  { value: "closed", label: "已结案", Icon: CheckCircle },
  { value: "scheduled", label: "预约中", Icon: Bell },
  { value: "live", label: "完赛后开庭", Icon: Clock },
];

export function CourtStateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const selected = options[selectedIndex];
  const Icon = selected.Icon;

  useEffect(() => {
    if (!open) return;
    menuRef.current?.focus({ preventScroll: true });
    const dismiss = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
    };
  }, [open]);

  const show = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };
  const choose = index => {
    onChange(options[index].value);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  return <div className="court-state-filter" ref={rootRef}>
    <button
      type="button"
      className="court-state-trigger"
      ref={triggerRef}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={menuId}
      aria-label={"筛选法庭状态：" + selected.label}
      onClick={() => open ? setOpen(false) : show()}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          show();
        }
      }}
    >
      <Icon size={17} weight="regular" aria-hidden="true" />
      <span>{selected.label}</span>
      <CaretDown className="court-state-caret" size={14} aria-hidden="true" />
    </button>
    {open && <div
      className="court-state-menu"
      id={menuId}
      ref={menuRef}
      role="listbox"
      aria-label="筛选法庭状态"
      aria-activedescendant={menuId + "-" + options[activeIndex].value}
      tabIndex={-1}
      onKeyDown={event => {
        switch (event.key) {
          case "ArrowDown": event.preventDefault(); setActiveIndex(i => (i + 1) % options.length); break;
          case "ArrowUp": event.preventDefault(); setActiveIndex(i => (i + options.length - 1) % options.length); break;
          case "Home": event.preventDefault(); setActiveIndex(0); break;
          case "End": event.preventDefault(); setActiveIndex(options.length - 1); break;
          case "Enter": case " ": event.preventDefault(); choose(activeIndex); break;
          case "Escape": event.preventDefault(); setOpen(false); triggerRef.current?.focus({ preventScroll: true }); break;
        }
      }}
    >
      {options.map(({ value: optionValue, label, Icon: OptionIcon }, index) => <button
        type="button"
        role="option"
        tabIndex={-1}
        id={menuId + "-" + optionValue}
        key={optionValue}
        aria-selected={optionValue === selected.value}
        className={"court-state-option" + (activeIndex === index ? " is-active" : "")}
        onPointerMove={() => setActiveIndex(index)}
        onClick={() => choose(index)}
      >
        <OptionIcon size={17} weight="regular" aria-hidden="true" />
        <span>{label}</span>
        {optionValue === selected.value && <Check size={15} weight="bold" aria-hidden="true" />}
      </button>)}
    </div>}
  </div>;
}
