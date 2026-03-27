# Examples - 使用示例

本目录包含 `src/core` 模块的使用示例，展示 Graph、Node、Edge、Port 等核心类的功能。

## 文件说明

- `GraphExample.tsx` - 完整的 Graph 组件使用示例
- `index.ts` - 示例模块导出

## 功能展示

### GraphExample 示例包含：

1. **节点创建**
   - 圆形节点（开始/结束）
   - 矩形节点（处理）
   - 多边形节点（判断/菱形）
   - 自定义样式配置

2. **边的连接**
   - 直线（Straight）
   - 水平折线（Horizontal）
   - 垂直折线（Vertical）
   - 贝塞尔曲线（Bezier）
   - 弧线（Arc）
   - 虚线样式
   - 箭头配置

3. **连接桩（Port/锚点）**
   - 在节点边缘添加连接点
   - 支持 top/right/bottom/left 四个方向
   - 用于精确控制边的连接位置

4. **交互功能**
   - 画布拖拽平移
   - 滚轮缩放
   - 节点拖拽移动
   - 节点选中
   - 边的悬停变色
   - 断开/重连边

5. **控制按钮**
   - 放大/缩小/重置视图
   - 断开/重连指定边
   - 删除选中节点

## 使用方法

```tsx
import { GraphExample } from './examples';

function App() {
    return <GraphExample />;
}
```

## API 参考

### Graph

```typescript
const graph = new Graph({
    container: HTMLElement,        // 容器元素（必需）
    width?: number,                // 画布宽度（默认 800）
    height?: number,               // 画布高度（默认 600）
    draggable?: boolean,           // 是否启用拖拽（默认 true）
    scalable?: boolean,            // 是否启用缩放（默认 true）
    backgroundColor?: string,      // 背景颜色
    grid?: {                       // 网格配置
        enabled: boolean;
        size?: number;
        color?: string;
    },
    onNodeSelect?: (node) => {},   // 节点选中回调
    onDragEnd?: (offset) => {},    // 拖拽完成回调
    onZoom?: (scale, offset) => {}, // 缩放完成回调
});

// 节点操作
graph.addNode(options: NodeOptions): Node;
graph.removeNode(nodeId: string): boolean;
graph.getNode(nodeId: string): Node | undefined;
graph.getAllNodes(): Node[];
graph.selectNode(nodeId: string | null): void;

// 边操作
graph.addEdge(options: EdgeOptions): Edge;
graph.removeEdge(edgeId: string): boolean;
graph.getEdge(edgeId: string): Edge | undefined;
graph.getAllEdges(): Edge[];
graph.selectEdge(edgeId: string | null): void;

// 视图操作
graph.zoomTo(scale: number): Promise<void>;
graph.panTo(offset: Point): Promise<void>;
graph.reset(): void;
graph.fitToContent(bounds, padding): void;

// 坐标转换
graph.screenToWorld(screenPoint: Point): Point;
graph.worldToScreen(worldPoint: Point): Point;
```

### Node

```typescript
const node = graph.addNode({
    id: string,                    // 节点 ID（必需）
    label?: string,                // 节点标签
    x: number,                     // X 坐标（必需）
    y: number,                     // Y 坐标（必需）
    shape?: Shape | ShapeConfig,   // 形状配置
    style?: Partial<NodeStyle>,    // 样式配置
    data?: Record<string, any>,    // 自定义数据
    resizable?: boolean,           // 是否可调整大小，默认 false
    portsAlwaysVisible?: boolean,  // 连接桩是否始终可见，默认 true
});

// 位置操作
node.getPosition(): { x, y };
node.setPosition(x, y): void;
node.move(deltaX, deltaY): void;

// 连接桩管理
node.addPort(options: PortOptions): Port;
node.removePort(portId): boolean;
node.getPort(portId): Port | undefined;
node.getAllPorts(): Port[];

// 连接桩可见性控制
node.portsAlwaysVisible: boolean;           // 获取连接桩是否始终可见
node.setPortsAlwaysVisible(visible): void;  // 设置连接桩是否始终可见

// 获取连接点
node.getAnchorPoint(position): { x, y };

// 碰撞检测
node.containsPoint(point): boolean;
```

### Edge

```typescript
const edge = graph.addEdge({
    id: string,                    // 边 ID（必需）
    source: string | EdgeAnchor,   // 源节点/连接点（必需）
    target: string | EdgeAnchor,   // 目标节点/连接点（必需）
    type?: EdgeType,               // 边类型（默认 Straight）
    label?: string,                // 边标签
    style?: Partial<EdgeStyle>,    // 样式配置
    onDisconnect?: (edge) => {},   // 断开连接回调
    data?: Record<string, any>,    // 自定义数据
});

// 连接状态
edge.isConnected(): boolean;
edge.disconnect(): boolean;        // 断开连接（隐藏线条）
edge.reconnect(): boolean;         // 重新连接（显示线条）

// 碰撞检测
edge.containsPoint(point, tolerance): boolean;
```

### Port（连接桩）

```typescript
const port = node.addPort({
    id: string,                    // 连接桩 ID（必需）
    position: PortPosition,        // 位置（必需）
    visible?: boolean,             // 是否可见（默认 true）
    style?: Partial<PortStyle>,    // 样式配置
    shape?: Shape | ShapeConfig,   // 形状配置
});

// 获取连接点坐标
port.getConnectionPoint(nodeX, nodeY, nodeWidth, nodeHeight): { x, y };

// 碰撞检测
port.containsPoint(point, nodeX, nodeY, nodeWidth, nodeHeight): boolean;
```

## 依赖说明

本项目依赖 `@zjpcy/simple-design` 组件库（已配置在 package.json 的 devDependencies 中），用于支持组件锚点功能。

```json
{
  "devDependencies": {
    "@zjpcy/simple-design": "^1.8.2"
  }
}
```
