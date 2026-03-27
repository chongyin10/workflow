# zjpcy-workflow - 大模型开发上下文

> **项目概述**：基于 React + TypeScript 的可交互流程图画布组件库

---

## 📁 目录结构

```
src/
├── core/              # 核心模块
│   ├── Cell.ts        # 基类：所有元素的父类
│   ├── Node.ts        # 节点类
│   ├── Edge.ts        # 边类（连接线）
│   ├── Port.ts        # 连接桩类
│   ├── Graph.ts       # 画布主类
│   ├── Shape.ts       # 形状渲染
│   ├── DynamicNode.ts # 动态高度节点
│   └── EventManager.ts# 事件管理器
├── plugins/           # 插件模块
│   ├── Dnd.ts         # 拖拽插件
│   ├── Dropdown.ts    # 右键菜单插件
│   ├── Snapline.ts    # 对齐线插件
│   ├── Clipboard.ts   # 剪贴板插件
│   ├── MiniMap.ts     # 小地图插件
│   ├── SiderPane.ts   # 侧边栏插件
│   └── ReactShape.ts  # React 形状插件
├── lib/
│   ├── index.ts       # 库入口
│   └── styles/        # 样式文件
└── examples/          # 示例代码
```

---

## 🎯 核心架构

### 继承关系
```
Cell (基类)
├── Node (节点)
│   └── DynamicHeightNode (动态高度节点)
├── Edge (边)
└── Port (连接桩)

Graph (画布) - 管理所有 Cell
```

---

## 🔧 核心类详解

### 1. Graph - 画布主类

**文件**: `src/core/Graph.ts`

**主要职责**: 画布初始化、渲染管理、事件处理、坐标变换

**主要属性**:
```typescript
class Graph {
  private container: HTMLElement
  private canvas: HTMLCanvasElement      // 节点渲染画布
  private edgeCanvas: HTMLCanvasElement  // 边渲染画布
  private overlay: HTMLDivElement        // HTML 节点容器
  private nodes: Map<string, Node>
  private edges: Map<string, Edge>
  private selectedNode: Node | null
  private selectedEdge: Edge | null
  private state: GraphState              // 画布状态（缩放、偏移）
}
```

**主要方法**:
```typescript
// 节点操作
addNode(options: NodeOptions): Node
removeNode(nodeId: string): void
getNode(nodeId: string): Node | undefined
getNodes(): Node[]

// 边操作
addEdge(options: EdgeOptions): Edge
removeEdge(edgeId: string): void
getEdge(edgeId: string): Edge | undefined
getEdges(): Edge[]

// 画布控制
reset(): void                          // 重置画布
zoomTo(scale: number): void            // 缩放到指定比例
panTo(offset: Point): void             // 平移到指定位置
fitToContent(bounds: Bounds): void     // 适应内容到视图

// 坐标转换
screenToWorld(point: Point): Point     // 屏幕坐标 → 世界坐标
worldToScreen(point: Point): Point     // 世界坐标 → 屏幕坐标

// 导出/序列化
toJSON(): { nodes: any[], edges: any[] }
fromJSON(data: any): void

// 销毁
destroy(): void
```

**GraphOptions**:
```typescript
interface GraphOptions {
  container: HTMLElement                // 容器（必填）
  width?: number                        // 画布宽度
  height?: number                       // 画布高度
  draggable?: boolean                   // 是否启用画布拖拽
  scalable?: boolean                    // 是否启用缩放
  minZoom?: number                      // 最小缩放比例
  maxZoom?: number                      // 最大缩放比例
  backgroundColor?: string              // 背景色
  grid?: {                              // 网格配置
    enabled: boolean
    size?: number
    color?: string
    type?: 'mesh' | 'dot'
  }
  validateConnection?: ConnectionValidator  // 连接验证
  dropdown?: DropdownOptions            // 右键菜单配置
  onDragEnd?: (offset: Point) => void   // 拖拽回调
  onZoom?: (scale: number) => void      // 缩放回调
}
```

---

### 2. Node - 节点类

**文件**: `src/core/Node.ts`

**职责**: 节点渲染、连接桩管理、交互处理

**主要属性**:
```typescript
class Node extends Cell {
  private position: NodePosition         // 位置坐标
  private style: NodeStyle               // 节点样式
  private ports: Map<string, Port>       // 连接桩集合
  private portManager: PortManager       // 连接桩管理器
  private _resizable: boolean            // 是否可调整大小
  private htmlElement: HTMLElement | null // HTML 节点元素
}
```

**主要方法**:
```typescript
// 位置
getPosition(): NodePosition
setPosition(pos: NodePosition): void

translate(dx: number, dy: number): void  // 相对移动

// 尺寸
getSize(): { width: number, height: number }
resize(width: number, height: number): void

// 样式
getStyle(): NodeStyle
setStyle(style: Partial<NodeStyle>): void

// 连接桩管理
addPort(options: PortOptions): Port
removePort(portId: string): void
getPort(portId: string): Port | undefined
getPorts(): Port[]

// 连接桩组（批量添加）
addPortGroup(options: PortGroupOptions): Port[]

// 事件监听
on(event: NodeEventType, handler: EventHandler): () => void
```

**NodeStyle**:
```typescript
interface NodeStyle {
  width: number
  height: number
  backgroundColor: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  textColor: string
  fontSize: number
  fontFamily: string
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  selectedBorderColor: string
  selectedBorderWidth: number
  hoverBackgroundColor: string
  shape?: ShapeConfig
}
```

---

### 3. Edge - 边类

**文件**: `src/core/Edge.ts`

**职责**: 边的渲染、路径计算、连接状态管理

**边类型**:
```typescript
enum EdgeType {
  Straight = 'straight',     // 直线
  Horizontal = 'horizontal', // 水平折线
  Vertical = 'vertical',     // 垂直折线
  Bezier = 'bezier',         // 贝塞尔曲线
  Arc = 'arc'                // 弧度曲线
}
```

**主要属性**:
```typescript
class Edge extends Cell {
  private source: EdgeAnchor    // 起点
  private target: EdgeAnchor    // 终点
  private type: EdgeType
  private style: EdgeStyle
  private connected: boolean    // 是否处于连接状态
}
```

**EdgeAnchor**:
```typescript
interface EdgeAnchor {
  nodeId: string              // 节点 ID
  portId?: string             // 连接桩 ID（优先）
  position?: 'top' | 'right' | 'bottom' | 'left'  // 位置（无 portId 时使用）
}
```

---

### 4. Port - 连接桩类

**文件**: `src/core/Port.ts`

**职责**: 连接桩渲染、位置计算、连接交互

**主要属性**:
```typescript
class Port extends Cell {
  private nodeId: string
  private position: PortPosition  // 'top' | 'right' | 'bottom' | 'left' | 'center' | {x, y}
  private portVisible: boolean    // 是否可见
  private style: PortStyle
}
```

**PortGroupOptions**:
```typescript
interface PortGroupOptions {
  id: string
  position: 'top' | 'right' | 'bottom' | 'left'
  count: number
  portConfig?: Partial<PortOptions> | ((index: number) => Partial<PortOptions>)
  layout?: Partial<PortLayoutConfig>
}
```

---

### 5. EventManager - 事件管理器

**文件**: `src/core/EventManager.ts`

**职责**: 统一的事件注册、触发、注销

**主要方法**:
```typescript
class EventManager {
  on(eventName: string, handler: EventHandler): () => void
  once(eventName: string, handler: EventHandler): () => void
  off(eventName: string, handler?: EventHandler): void
  emit(eventName: string, eventData: any): boolean
}
```

**EVENT_NAMES 常量**:
```typescript
const EVENT_NAMES = {
  // Cell 事件
  CELL_CLICK: 'cell:click',
  CELL_DBLCLICK: 'cell:dblclick',
  CELL_CONTEXTMENU: 'cell:contextmenu',
  CELL_MOUSEDOWN: 'cell:mousedown',
  CELL_MOUSEMOVE: 'cell:mousemove',
  CELL_MOUSEUP: 'cell:mouseup',
  CELL_MOUSEWHEEL: 'cell:mousewheel',
  CELL_MOUSEENTER: 'cell:mouseenter',
  CELL_MOUSELEAVE: 'cell:mouseleave',
  
  // Node 事件
  NODE_CLICK: 'node:click',
  NODE_DBLCLICK: 'node:dblclick',
  NODE_CONTEXTMENU: 'node:contextmenu',
  NODE_MOUSEDOWN: 'node:mousedown',
  NODE_MOUSEMOVE: 'node:mousemove',
  NODE_MOUSEUP: 'node:mouseup',
  NODE_MOUSEWHEEL: 'node:mousewheel',
  NODE_MOUSEENTER: 'node:mouseenter',
  NODE_MOUSELEAVE: 'node:mouseleave',
  NODE_DRAGSTART: 'node:dragstart',
  NODE_DRAG: 'node:drag',
  NODE_DRAGEND: 'node:dragend',
  NODE_SELECTED: 'node:selected',
  NODE_UNSELECTED: 'node:unselected',
  
  // Port 事件
  PORT_CLICK: 'node:port:click',
  PORT_DBLCLICK: 'node:port:dblclick',
  PORT_CONTEXTMENU: 'node:port:contextmenu',
  PORT_MOUSEDOWN: 'node:port:mousedown',
  PORT_MOUSEMOVE: 'node:port:mousemove',
  PORT_MOUSEUP: 'node:port:mouseup',
  PORT_MOUSEENTER: 'node:port:mouseenter',
  PORT_MOUSELEAVE: 'node:port:mouseleave',
  
  // Edge 事件
  EDGE_CLICK: 'edge:click',
  EDGE_DBLCLICK: 'edge:dblclick',
  EDGE_CONTEXTMENU: 'edge:contextmenu',
  EDGE_MOUSEDOWN: 'edge:mousedown',
  EDGE_MOUSEMOVE: 'edge:mousemove',
  EDGE_MOUSEUP: 'edge:mouseup',
  EDGE_MOUSEWHEEL: 'edge:mousewheel',
  EDGE_MOUSEENTER: 'edge:mouseenter',
  EDGE_MOUSELEAVE: 'edge:mouseleave',
  
  // Graph/Blank 事件
  BLANK_CLICK: 'blank:click',
  BLANK_CONTEXTMENU: 'blank:contextmenu',
} as const
```

---

## 🔌 插件系统

### 插件接口
```typescript
interface Plugin {
  name: string
  install(graph: Graph): void
  uninstall(): void
}
```

### 注册插件
```typescript
const graph = new Graph({ container })
graph.use(new Dnd({ enabled: true }))
graph.use(new Dropdown({ nodeMenu: [...] }))
graph.use(new Snapline({ enabled: true }))
graph.use(new Clipboard({ enabled: true }))
```

---

### 1. Dnd 插件 - 外部拖拽

**文件**: `src/plugins/Dnd.ts`

**功能**: 从外部 DOM 拖拽节点到画布

```typescript
class Dnd implements Plugin {
  constructor(options: DndOptions)
}

interface DndOptions {
  enabled?: boolean
  allowOverlap?: boolean           // 是否允许重叠放置
  onDragStart?: (e: DndEvent) => void
  onDrop?: (e: DndEvent) => boolean | void  // 返回 false 阻止放置
  validateDrop?: (position: Point, nodeOptions: NodeOptions) => boolean
}

// 绑定拖拽源（HTML 元素）
dnd.bindSource(element: HTMLElement, config: DndSourceConfig): void
dnd.unbindSource(element: HTMLElement): void
```

---

### 2. Dropdown 插件 - 右键菜单

**文件**: `src/plugins/Dropdown.ts`

**功能**: 为节点、边、空白区域提供右键菜单

```typescript
class Dropdown implements Plugin {
  constructor(options: DropdownOptions)
}

interface DropdownOptions {
  nodeMenu?: MenuItem[] | ((node: Node) => MenuItem[])
  edgeMenu?: MenuItem[] | ((edge: Edge) => MenuItem[])
  cellMenu?: MenuItem[] | ((cell: Cell) => MenuItem[])
  blankMenu?: MenuItem[] | ((event: any) => MenuItem[])
  menuWidth?: number
  backgroundColor?: string
  closeOnClickOutside?: boolean
}

interface MenuItem {
  label: string
  icon?: string
  action: (target: Node | Edge | Cell | null, event: any) => void
  danger?: boolean        // 是否为危险操作（红色）
  disabled?: boolean
}
```

**简写方式**（推荐）:
```typescript
const graph = new Graph({
  container,
  dropdown: {
    nodeMenu: [
      { label: '删除', icon: '🗑️', danger: true, action: (node) => graph.removeNode(node.getId()) }
    ],
    blankMenu: [
      { label: '添加节点', action: (e) => graph.addNode({ x: e.x, y: e.y, label: '新节点' }) }
    ]
  }
})
```

---

### 3. Snapline 插件 - 对齐线

**文件**: `src/plugins/Snapline.ts`

**功能**: 拖拽节点时显示对齐辅助线

```typescript
class Snapline implements Plugin {
  constructor(options: SnaplineOptions)
}

interface SnaplineOptions {
  enabled?: boolean
  tolerance?: number        // 对齐容差（像素）
  lineColor?: string
  lineWidth?: number
  lineDash?: number[]
  showCenter?: boolean      // 是否显示居中对齐
  showEdge?: boolean        // 是否显示边缘对齐
  snap?: boolean            // 是否吸附
  snapStrength?: number     // 吸附强度
}
```

---

### 4. Clipboard 插件 - 剪贴板

**文件**: `src/plugins/Clipboard.ts`

**功能**: 复制、粘贴、剪切、删除（支持快捷键）

```typescript
class Clipboard implements Plugin {
  constructor(options: ClipboardOptions)
  
  // 方法
  copy(nodes?: Node[], edges?: Edge[]): void
  paste(): { nodes: Node[], edges: Edge[] }
  cut(nodes?: Node[], edges?: Edge[]): void
  deleteSelected(): void
}

interface ClipboardOptions {
  enabled?: boolean
  useSystemClipboard?: boolean    // 是否使用系统剪贴板
  pasteOffset?: number            // 粘贴偏移量
  keepOriginalId?: boolean        // 是否保持原 ID
  onCopy?: (data: ClipboardData) => void
  onPaste?: (nodes: Node[], edges: Edge[]) => void
}
```

**快捷键**:
- `Ctrl/Cmd + C` - 复制选中节点
- `Ctrl/Cmd + V` - 粘贴
- `Ctrl/Cmd + X` - 剪切
- `Delete` / `Backspace` - 删除选中

---

### 5. MiniMap 插件 - 小地图

**文件**: `src/plugins/MiniMap.ts`

**功能**: 显示整个画布的缩略图

```typescript
class MiniMap implements Plugin {
  constructor(options: MiniMapOptions)
  
  show(): void
  hide(): void
  update(): void      // 手动更新缩略图
}

interface MiniMapOptions {
  container?: HTMLElement          // 容器（默认自动创建）
  width?: number                   // 宽度
  height?: number                  // 高度
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  padding?: number
  borderColor?: string
  viewportColor?: string           // 视口框颜色
}
```

---

### 6. SiderPane 插件 - 侧边栏

**文件**: `src/plugins/SiderPane.ts`

**功能**: 左侧工具栏/节点面板

```typescript
class SiderPane implements Plugin {
  constructor(options: SiderPaneOptions)
  
  show(): void
  hide(): void
  toggle(): void
}

interface SiderPaneOptions {
  container?: HTMLElement
  width?: number
  items?: SiderPaneItem[]
}

interface SiderPaneItem {
  id: string
  icon: string | HTMLElement
  label: string
  onClick?: () => void
}
```

---

### 7. ReactShape 插件 - React 形状

**文件**: `src/plugins/ReactShape.ts`

**功能**: 在节点中使用 React 组件渲染

```typescript
// 注册 React 形状
registerReactShape(id: string, component: React.FC<ReactNodeProps>): void

// 节点配置中使用
const node = graph.addNode({
  x: 100,
  y: 100,
  shape: {
    type: 'react',
    component: 'MyCustomComponent'  // 注册时的 ID
  }
})
```

---

## 📊 典型使用场景

### 场景1: 基础流程图
```typescript
const graph = new Graph({
  container: document.getElementById('canvas'),
  grid: { enabled: true, size: 20 }
})

// 添加节点
const node1 = graph.addNode({ x: 100, y: 100, label: '开始' })
const node2 = graph.addNode({ x: 300, y: 100, label: '处理' })

// 添加边
graph.addEdge({
  source: node1.getId(),
  target: node2.getId(),
  type: EdgeType.Horizontal
})
```

### 场景2: 带连接桩的节点
```typescript
const node = graph.addNode({
  x: 100,
  y: 100,
  label: '任务节点',
  resizable: true
})

// 添加连接桩组
node.addPortGroup({
  id: 'left',
  position: 'left',
  count: 3
})

node.addPortGroup({
  id: 'right',
  position: 'right',
  count: 2
})
```

### 场景3: 完整功能配置
```typescript
const graph = new Graph({
  container,
  draggable: true,
  scalable: true,
  minZoom: 0.1,
  maxZoom: 3,
  grid: { enabled: true, size: 20, type: 'dot' },
  
  // 连接验证
  validateConnection: ({ sourceNode, targetNode }) => {
    return sourceNode.getId() !== targetNode.getId()
  },
  
  // 右键菜单
  dropdown: {
    nodeMenu: [
      { label: '复制', icon: '📋', action: (node) => {} },
      { label: '删除', icon: '🗑️', danger: true, action: (node) => graph.removeNode(node.getId()) }
    ]
  },
  
  // 事件监听
  onNodeSelect: (node) => console.log('选中:', node?.getId()),
  onZoom: (scale) => console.log('缩放:', scale)
})

// 安装插件
graph.use(new Snapline({ enabled: true, tolerance: 10 }))
graph.use(new Clipboard({ enabled: true }))
graph.use(new MiniMap({ width: 200, height: 150, position: 'bottom-right' }))
```

---

## ⚠️ 开发注意事项

1. **坐标系统**：所有内部坐标都是世界坐标，渲染时通过 `worldToScreen` 转换
2. **画布分层**：节点和边分别绘制在不同的 canvas 上（z-index 管理）
3. **HTML 节点**：支持 React 组件渲染，但需注意性能
4. **事件冒泡**：节点/边事件会冒泡到 Graph，可通过 `stopPropagation()` 阻止
5. **插件顺序**：建议先安装基础插件（Dnd），再安装依赖插件

---

## 🐛 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 节点无法显示 | 未添加到 Graph | 使用 `graph.addNode()` |
| 边无法连接 | 连接桩不存在 | 检查 `portId` 是否正确 |
| 右键菜单不显示 | Dropdown 未注册 | 配置 `dropdown` 选项或 `graph.use(new Dropdown())` |
| 对齐线不生效 | Snapline 未注册 | `graph.use(new Snapline({ enabled: true }))` |
| HTML 节点位置偏移 | 坐标未转换 | 使用 Graph 提供的坐标转换方法 |

---

## 📦 发布配置

- **入口文件**: `src/lib/index.ts`
- **构建输出**: `dist/` 目录
  - `dist/esm/` - ES Module 格式（保留目录结构）
  - `dist/cjs/` - CommonJS 格式（保留目录结构）
  - `dist/umd/` - UMD 单文件（浏览器直接引用）
- **构建命令**: `npm run build:lib`
- **发布命令**: `npm publish`

---

*最后更新: 2025-03-26*
