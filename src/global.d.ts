declare module "maplibre-gl/dist/maplibre-gl.css";
declare module "*.css";
declare module "*.module.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.webp";
declare module "*.gif";

/* ---------------- React local fallback types ---------------- */

declare module "next/dynamic" {
  const dynamic: any;
  export default dynamic;
}

declare module "@clerk/nextjs" {
  export const ClerkProvider: any;
  export const SignedIn: any;
  export const SignedOut: any;
  export const SignInButton: any;
  export const SignUpButton: any;
  export const UserButton: any;
  export const useUser: any;
  export const useAuth: any;
  export const Show: any;
}

declare module "@clerk/nextjs/server" {
  export function auth(): Promise<any>;
  export const currentUser: any;
  export const clerkClient: any;
}

declare module "react" {
  export type Key = string | number;
  export type ReactNode = any;
  export type ReactElement = any;
  export type JSXElementConstructor<P = any> = any;
  export type ElementType<P = any> = any;
  export type ComponentType<P = any> = any;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactElement | null;
  export type FunctionComponent<P = {}> = FC<P>;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };

  export function useSyncExternalStore<T = any>(
  subscribe: any,
  getSnapshot: any,
  getServerSnapshot?: any
): T;

  export type CSSProperties = Record<string, string | number | undefined>;

  export type Ref<T> =
    | ((instance: T | null) => void)
    | MutableRefObject<T | null>
    | null;

  export type RefObject<T> = {
    current: T | null;
  };

  export type MutableRefObject<T> = {
    current: T;
  };

  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);

  export interface SyntheticEvent<T = Element, E = Event> {
    nativeEvent: E;
    currentTarget: T;
    target: EventTarget;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    preventDefault(): void;
    stopPropagation(): void;
  }

  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }

  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}

  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    key: string;
    code: string;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  }

  export interface MouseEvent<T = Element> extends SyntheticEvent<T> {
    clientX: number;
    clientY: number;
    button: number;
  }

  export interface HTMLAttributes<T> {
    [key: string]: any;
  }

  export interface DetailedHTMLProps<E, T> {
    [key: string]: any;
  }

  export function useState<S = any>(
    initialState?: S | (() => S)
  ): [S, Dispatch<SetStateAction<S>>];

  export function useEffect(
    effect: () => void | (() => void),
    deps?: any[]
  ): void;

  export function useLayoutEffect(
    effect: () => void | (() => void),
    deps?: any[]
  ): void;

  export function useRef<T = any>(initialValue?: T): MutableRefObject<T>;

  export function useMemo<T = any>(factory: () => T, deps?: any[]): T;

  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps?: any[]
  ): T;

  export function useContext<T = any>(context: any): T;

  export function useReducer<R = any>(
    reducer: any,
    initialArg: any,
    init?: any
  ): [any, Dispatch<any>];

  export function useId(): string;

  export function useTransition(): [boolean, (callback: () => void) => void];

  export function createContext<T = any>(defaultValue?: T): any;

  export function createElement(...args: any[]): any;

  export function forwardRef<T = any, P = any>(render: any): any;

  export function memo<T = any>(component: T, propsAreEqual?: any): T;

  export const Fragment: any;
  export const Suspense: any;

  const React: {
    useState: typeof useState;
    useEffect: typeof useEffect;
    useLayoutEffect: typeof useLayoutEffect;
    useRef: typeof useRef;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    useContext: typeof useContext;
    useReducer: typeof useReducer;
    useId: typeof useId;
    useTransition: typeof useTransition;
    createContext: typeof createContext;
    createElement: typeof createElement;
    forwardRef: typeof forwardRef;
    memo: typeof memo;
    useSyncExternalStore: typeof useSyncExternalStore;
    Fragment: any;
    Suspense: any;
  };

  export default React;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "react-dom" {
  const ReactDOM: any;
  export default ReactDOM;
}

declare module "react-dom/client" {
  export const createRoot: any;
  export const hydrateRoot: any;
}

/* ---------------- Next local fallback types ---------------- */

declare module "next" {
  const next: any;
  export default next;
}

declare module "next/link" {
  const Link: any;
  export default Link;
}

declare module "next/image" {
  const Image: any;
  export default Image;
}

declare module "next/navigation" {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
  export function redirect(path: string): never;
  export function notFound(): never;
}

declare module "next/server" {
  export class NextRequest extends Request {
    nextUrl: URL;
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}

declare module "next/headers" {
  export function cookies(): any;
  export function headers(): any;
}

/* ---------------- Third-party module fallbacks ---------------- */

declare module "react-globe.gl" {
  const Globe: any;
  export default Globe;
}

declare module "maplibre-gl" {
  export type GeoJSONSource = {
    setData(data: any): void;
  };

  export type MapLayerMouseEvent = any;
  export type MapMouseEvent = any;
  export type LngLatLike = any;
  export type MapOptions = any;
  export type ExpressionSpecification = any;
  export type StyleSpecification = any;
  export type LayerSpecification = any;
  export type SourceSpecification = any;
  export type PaddingOptions = any;
  export type LngLatBoundsLike = any;

export class Map {
  dragPan: any;
  doubleClickZoom: any;

  constructor(options?: any);

  on(...args: any[]): any;
  off(...args: any[]): any;
  once(...args: any[]): any;

  remove(): void;
  resize(): void;

  isStyleLoaded(): boolean;
  setTerrain(options?: { source?: string; exaggeration?: number } | null): this;

  addControl(control: any, position?: string): this;
  removeControl(control: any): this;

  addSource(...args: any[]): any;
  getSource(id: string): GeoJSONSource | undefined;
  removeSource(id: string): any;

  addLayer(...args: any[]): any;
  getLayer(id: string): any;
  removeLayer(id: string): any;

  setPaintProperty(...args: any[]): any;
  setLayoutProperty(...args: any[]): any;
  setFilter(...args: any[]): any;
  setProjection(...args: any[]): any;
  setStyle(...args: any[]): any;

  fitBounds(...args: any[]): any;
  flyTo(...args: any[]): any;
  easeTo(...args: any[]): any;
  jumpTo(...args: any[]): any;

  addSources(...args: any[]): any;
moveLayer(...args: any[]): any;

  getZoom(): number;
  getCenter(): any;
  getBearing(): number;
  getPitch(): number;
  getCanvas(): HTMLCanvasElement;
  getCanvasContainer(): HTMLElement;
  project(...args: any[]): any;
  unproject(...args: any[]): any;
  queryRenderedFeatures(...args: any[]): any[];
}


  export class NavigationControl {
    constructor(options?: any);
  }

  export class Marker {
    constructor(options?: any);
    setLngLat(...args: any[]): this;
    addTo(...args: any[]): this;
    remove(): void;
    getElement(): HTMLElement;
  }

  export class Popup {
    constructor(options?: any);
    setLngLat(...args: any[]): this;
    setHTML(...args: any[]): this;
    setDOMContent(...args: any[]): this;
    addTo(...args: any[]): this;
    remove(): void;
  }

  export class LngLat {
    constructor(lng: number, lat: number);
    lng: number;
    lat: number;
  }

  export class LngLatBounds {
    constructor(...args: any[]);
    extend(...args: any[]): this;
    getCenter(): LngLat;
  }

  const maplibregl: {
    Map: typeof Map;
    NavigationControl: typeof NavigationControl;
    Marker: typeof Marker;
    Popup: typeof Popup;
    LngLat: typeof LngLat;
    LngLatBounds: typeof LngLatBounds;
  };

  export default maplibregl;
}

declare namespace maplibregl {
  type GeoJSONSource = import("maplibre-gl").GeoJSONSource;
  type MapLayerMouseEvent = any;
  type MapMouseEvent = any;
  type LngLatLike = any;
  type MapOptions = any;
  type ExpressionSpecification = any;
  type StyleSpecification = any;
  type LayerSpecification = any;
  type SourceSpecification = any;
  type PaddingOptions = any;
  type LngLatBoundsLike = any;

  type Map = import("maplibre-gl").Map;
  type NavigationControl = import("maplibre-gl").NavigationControl;
  type Marker = import("maplibre-gl").Marker;
  type Popup = import("maplibre-gl").Popup;
  type LngLat = import("maplibre-gl").LngLat;
  type LngLatBounds = import("maplibre-gl").LngLatBounds;
}

declare module "lucide-react" {
  export const Bot: any;
  export const MessageCircle: any;
  export const MinusCircle: any;
  export const RotateCcw: any;
  export const Menu: any;
  export const Search: any;
  export const X: any;
  export const User: any;
  export const Map: any;
  export const MapPin: any;
  export const Globe: any;
  export const BookOpen: any;
  export const Brain: any;
  export const Sparkles: any;
  export const ChevronDown: any;
  export const ChevronUp: any;
  export const ChevronLeft: any;
  export const ChevronRight: any;
  export const Play: any;
  export const Pause: any;
  export const Send: any;
  export const Loader2: any;
  export const Settings: any;
  export const Star: any;
  export const Trophy: any;
  export const CheckCircle: any;
  export const CheckCircle2: any;
  export const XCircle: any;
  export const Target: any;
  export const BrainCircuit: any;
  export const Crown: any;
  export const Scroll: any;
  export const Swords: any;
  export const RefreshCw: any;
  export const Medal: any;
  export const Award: any;
  export const LogIn: any;
  export const LogOut: any;
  export const UserPlus: any;
  export const Info: any;
  export const AlertCircle: any;
  export const ArrowLeft: any;
  export const ArrowRight: any;
  export const Plus: any;
  export const Minus: any;
  export const Trash: any;
  export const Trash2: any;
  export const Edit: any;
  export const Edit2: any;
  export const Save: any;
  export const Eye: any;
  export const EyeOff: any;
  export const Calendar: any;
  export const Clock: any;
  export const Home: any;
  export const Layers: any;
  export const MapPinned: any;
  export const Compass: any;
  export const Shield: any;
  export const Wand2: any;
    export const Edit3: any;
  export const WandSparkles: any;
  export const PlusCircle: any;
}

declare module "zod" {
  export const z: any;
}

declare module "openai" {
  export type ChatCompletionMessageParam = any;
  export type ChatCompletionCreateParams = any;

  export default class OpenAI {
    constructor(config?: any);
    chat: any;
    responses: any;
    embeddings: any;
    images: any;
    audio: any;
    files: any;
  }
}

/* ---------------- JSX fallback ---------------- */

declare namespace JSX {
  interface Element {
    [key: string]: any;
  }

  interface ElementClass {
    [key: string]: any;
  }

  interface ElementAttributesProperty {
    props: any;
  }

  interface ElementChildrenAttribute {
    children: any;
  }

  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

/* ---------------- GeoJSON fallback ---------------- */

declare namespace GeoJSON {
  type Position = number[];

  interface Point {
    type: "Point";
    coordinates: Position;
  }

  interface MultiPoint {
    type: "MultiPoint";
    coordinates: Position[];
  }

  interface LineString {
    type: "LineString";
    coordinates: Position[];
  }

  interface MultiLineString {
    type: "MultiLineString";
    coordinates: Position[][];
  }

  interface Polygon {
    type: "Polygon";
    coordinates: Position[][];
  }

  interface MultiPolygon {
    type: "MultiPolygon";
    coordinates: Position[][][];
  }

  interface GeometryCollection {
    type: "GeometryCollection";
    geometries: Geometry[];
  }

  type Geometry =
    | Point
    | MultiPoint
    | LineString
    | MultiLineString
    | Polygon
    | MultiPolygon
    | GeometryCollection;

  interface Feature<G = Geometry, P = Record<string, unknown>> {
    type: "Feature";
    geometry: G;
    properties: P;
  }

  interface FeatureCollection<G = Geometry, P = Record<string, unknown>> {
    type: "FeatureCollection";
    features: Array<Feature<G, P>>;
  }
}

/* ---------------- Node process fallback ---------------- */

declare const process: {
  env: Record<string, string | undefined>;
};