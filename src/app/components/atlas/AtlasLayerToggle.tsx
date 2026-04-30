"use client";

type ToggleHandler = () => void;
type LayerKey = "states" | "labels" | "capitals" | "battles";

type AtlasLayerToggleProps = {
  value?: Partial<Record<LayerKey, boolean>>;
  onChange?: (key: LayerKey, next: boolean) => void;
  showStates?: boolean;
  showLabels?: boolean;
  showCapitals?: boolean;
  statesVisible?: boolean;
  labelsVisible?: boolean;
  capitalsVisible?: boolean;
  isStatesVisible?: boolean;
  isLabelsVisible?: boolean;
  isCapitalsVisible?: boolean;
  onToggleStates?: ToggleHandler;
  onToggleLabels?: ToggleHandler;
  onToggleCapitals?: ToggleHandler;
  onStatesToggle?: ToggleHandler;
  onLabelsToggle?: ToggleHandler;
  onCapitalsToggle?: ToggleHandler;
  toggleStates?: ToggleHandler;
  toggleLabels?: ToggleHandler;
  toggleCapitals?: ToggleHandler;
  [key: string]: unknown;
};

type LayerToggleItem = {
  key: string;
  label: string;
  active: boolean;
  onClick?: ToggleHandler;
};

function pickBoolean(...values: Array<boolean | undefined>) {
  return values.find((value) => typeof value === "boolean") ?? false;
}

function pickHandler(...handlers: Array<ToggleHandler | undefined>) {
  return handlers.find((handler) => typeof handler === "function");
}

function LayerButton({ label, active, onClick }: LayerToggleItem) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative h-8 shrink-0 rounded-full border px-4 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.18),0_8px_18px_rgba(37,99,235,0.28)]"
          : "border-blue-500/30 bg-blue-50/85 text-blue-700 hover:border-blue-500/70 hover:bg-blue-100"
      }`}
    >
      {active && (
        <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-blue-500/80" />
      )}
      {label}
    </button>
  );
}

export function AtlasLayerToggle(props: AtlasLayerToggleProps) {
  const items: LayerToggleItem[] = [
    {
      key: "states",
      label: "States",
      active: pickBoolean(
        props.value?.states,
        props.showStates,
        props.statesVisible,
        props.isStatesVisible,
      ),
      onClick: pickHandler(
        props.onChange
          ? () => props.onChange?.("states", !(props.value?.states ?? false))
          : undefined,
        props.onToggleStates,
        props.onStatesToggle,
        props.toggleStates,
      ),
    },
    {
      key: "labels",
      label: "Labels",
      active: pickBoolean(
        props.value?.labels,
        props.showLabels,
        props.labelsVisible,
        props.isLabelsVisible,
      ),
      onClick: pickHandler(
        props.onChange
          ? () => props.onChange?.("labels", !(props.value?.labels ?? false))
          : undefined,
        props.onToggleLabels,
        props.onLabelsToggle,
        props.toggleLabels,
      ),
    },
    {
      key: "capitals",
      label: "War",
      active: pickBoolean(
        props.value?.capitals,
        props.showCapitals,
        props.capitalsVisible,
        props.isCapitalsVisible,
      ),
      onClick: pickHandler(
        props.onChange
          ? () => props.onChange?.("capitals", !(props.value?.capitals ?? false))
          : undefined,
        props.onToggleCapitals,
        props.onCapitalsToggle,
        props.toggleCapitals,
      ),
    },
  ];

  return (
    <div className="pointer-events-auto inline-flex w-fit max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-blue-500/30 bg-white/90 p-2 shadow-lg shadow-blue-950/10 backdrop-blur-md">
      {items.map(({ key, ...item }) => (
        <LayerButton key={key} {...item} />
      ))}
    </div>
  );
}

export default AtlasLayerToggle;
