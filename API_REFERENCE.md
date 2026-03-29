# Graph 流程图引擎 API 文档

本文档包含 Graph 流程图引擎的所有核心类、方法、属性和事件，便于大模型快速读取和理解。

## 目录

- [核心类](#核心类)
  - [Graph](#graph)
  - [Node](#node)
  - [Edge](#edge)
  - [Port](#port)
  - [Cell](#cell)
  - [DynamicHeightNode](#dynamicheightnode)
  - [EventManager](#eventmanager)
- [插件系统](#插件系统)
- [类型定义](#类型定义)
- [事件列表](#事件列表)

---

## 核心类

### Graph

Graph 是画布组件，支持拖拽平移、鼠标滚轮缩放、网格背景等功能。

#### 构造函数

```typescript
constructor(options: GraphOptions)
```

#### 配置选项 (GraphOptions)

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `container` | `HTMLElement` | 容器元素（必需） | - |
| `width` | `number` | 画布宽度 | 800 |
| `height` | `number` | 画布高度 | 600 |
| `initialOffsetX` | `number` | 初始偏移 X | 0 |
| `initialOffsetY` | `number` | 初始偏移 Y | 0 |
| `minZoom` | `number` | 最小缩放比例 | 0.1 |
| `maxZoom` | `number` | 最大缩放比例 | 5 |
| `draggable` | `boolean` | 是否启用拖拽 | true |
| `scalable` | `boolean` | 是否启用缩放 | true |
| `draggingCursor` | `string` | 拖拽时的光标样式 | 'grabbing' |
| `onDragEnd` | `(offset: Point) => void` | 拖拽完成回调 | noop |
| `onZoom` | `(scale: number, offset: Point) => void` | 缩放完成回调 | noop |
| `onNodeSelect` | `(node: Node \| null) => void` | 节点选中回调 | noop |
| `backgroundColor` | `string` | 背景颜色 | '#ffffff' |
| `grid` | `{ enabled, size?, color?, type? }` | 网格配置 | { enabled: true, size: 20, color: '#e5e7eb', type: 'mesh' } |
| `validateConnection` | `ConnectionValidator` | 连接验证函数 | () => true |
| `dropdown` | `DropdownOptions` | 右键菜单配置 | - |

#### 静态方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `register(config)` | `{ shape, width?, height?, style?, component?, ports?, ... }` | `void` | 注册自定义形状 |
| `unregister(shapeName)` | `string` | `boolean` | 注销形状 |
| `getRegisteredShape(shapeName)` | `string` | `any` | 获取已注册的形状配置 |
| `hasRegisteredShape(shapeName)` | `string` | `boolean` | 检查形状是否已注册 |
| `getRegisteredShapes()` | - | `string[]` | 获取所有已注册的形状名称 |
| `clearRegisteredShapes()` | - | `void` | 清空所有已注册的形状 |

#### 节点管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addNode(nodeOrOptions)` | `NodeOptions \| Node` | `Node` | 添加节点 |
| `addReactNode(options)` | `{ shape, x, y, id?, label?, data?, style? }` | `any` | 添加 React 节点 |
| `removeNode(nodeId)` | `string` | `boolean` | 移除节点 |
| `getNode(nodeId)` | `string` | `Node \| undefined` | 获取节点 |
| `getAllNodes()` | - | `Node[]` | 获取所有节点 |
| `getSelectedNode()` | - | `Node \| null` | 获取选中的节点 |
| `selectNode(nodeId, triggerUnselectImmediately?)` | `string \| null, boolean` | `void` | 选中节点 |
| `clearNodes()` | - | `void` | 清除所有节点 |

#### 边管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addEdge(options)` | `EdgeOptions` | `Edge` | 添加边 |
| `removeEdge(edgeId)` | `string` | `boolean` | 移除边 |
| `getEdge(edgeId)` | `string` | `Edge \| undefined` | 获取边 |
| `getAllEdges()` | - | `Edge[]` | 获取所有边 |
| `getSelectedEdge()` | - | `Edge \| null` | 获取选中的边 |
| `selectEdge(edgeId)` | `string \| null` | `void` | 选中边 |
| `clearEdges()` | - | `void` | 清除所有边 |
| `clear()` | - | `void` | 清除所有节点和边 |

#### 视图控制方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getTransform()` | - | `{ offset: Point, scale: number }` | 获取当前变换矩阵 |
| `setOffset(offset)` | `Point` | `void` | 设置偏移量 |
| `setScale(scale)` | `number` | `void` | 设置缩放比例 |
| `panTo(offset, duration?, easing?)` | `Point, number, function` | `Promise<void>` | 平移到指定位置（带动画） |
| `zoomTo(scale, duration?, easing?)` | `number, number, function` | `Promise<void>` | 缩放到指定比例（带动画） |
| `reset()` | - | `void` | 重置视图 |
| `resetToCenter()` | - | `void` | 重置到画布中心 |
| `zoomIn(factor?)` | `number` | `void` | 放大画布 |
| `zoomOut(factor?)` | `number` | `void` | 缩小画布 |
| `getZoom()` | - | `number` | 获取当前缩放比例 |
| `fitToContent(bounds, padding?)` | `{x,y,width,height}, number` | `void` | 适应内容到视图 |

#### 网格配置方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setGridSize(size)` | `number` | `void` | 设置网格大小 |
| `setGridColor(color)` | `string` | `void` | 设置网格颜色 |
| `setGridEnabled(enabled)` | `boolean` | `void` | 启用/禁用网格 |
| `setGridType(type)` | `'mesh' \| 'dot'` | `void` | 设置网格类型 |
| `getGridConfig()` | - | `{ enabled, size, color, type }` | 获取网格配置 |

#### 坐标转换方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `screenToWorld(screenPoint)` | `Point` | `Point` | 屏幕坐标转世界坐标 |
| `worldToScreen(worldPoint)` | `Point` | `Point` | 世界坐标转屏幕坐标 |

#### 导出方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getFullCanvas(padding?)` | `number` | `HTMLCanvasElement` | 获取完整画布内容 |
| `getViewportCanvas()` | - | `HTMLCanvasElement` | 获取视口截图 |
| `getViewport()` | - | `{ width, height }` | 获取视口尺寸 |
| `toJSON()` | - | `{ cells: [...] }` | 导出为 JSON |

#### 其他方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getContext()` | - | `CanvasRenderingContext2D` | 获取 Canvas 上下文 |
| `getCanvas()` | - | `HTMLCanvasElement` | 获取 Canvas 元素 |
| `getEdgeCanvas()` | - | `HTMLCanvasElement` | 获取边线层 Canvas |
| `getOverlay()` | - | `HTMLDivElement` | 获取 Overlay 层 |
| `setDraggable(enabled)` | `boolean` | `void` | 启用/禁用拖拽 |
| `setScalable(enabled)` | `boolean` | `void` | 启用/禁用缩放 |
| `scheduleRender()` | - | `void` | 调度渲染 |
| `destroy()` | - | `void` | 销毁组件 |

#### 事件方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `on(eventName, handler)` | `string, EventHandler` | `() => void` | 注册事件（返回注销函数） |
| `once(eventName, handler)` | `string, EventHandler` | `() => void` | 注册一次性事件 |
| `off(eventName, handler?)` | `string, EventHandler?` | `void` | 注销事件 |

#### 插件方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `use(plugin)` | `Plugin` | `this` | 注册插件（链式调用） |
| `unuse(pluginName)` | `string` | `this` | 注销插件 |
| `getPlugin<T>(pluginName)` | `string` | `T \| undefined` | 获取插件实例 |
| `hasPlugin(pluginName)` | `string` | `boolean` | 检查插件是否已注册 |

---

### Node

Node 是节点类，继承自 Cell，支持位置、样式、连接桩等管理。

#### 构造函数

```typescript
constructor(options: NodeOptions)
```

#### 配置选项 (NodeOptions)

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 节点 ID（必需） |
| `x` | `number` | X 坐标 |
| `y` | `number` | Y 坐标 |
| `label` | `string` | 标签文字 |
| `data` | `Record<string, any>` | 自定义数据 |
| `shape` | `Shape \| ShapeConfig \| string` | 形状配置 |
| `style` | `Partial<NodeStyle>` | 节点样式 |
| `resizable` | `boolean` | 是否可调整大小 |
| `portsAlwaysVisible` | `boolean` | 连接桩是否始终可见 |
| `zIndex` | `number` | 层级索引 |
| `visible` | `boolean` | 是否可见 |
| `locked` | `boolean` | 是否锁定 |

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `resizable` | `boolean` | 是否可调整大小（getter） |
| `portsAlwaysVisible` | `boolean` | 连接桩是否始终可见（getter） |

#### 位置方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getPosition()` | - | `NodePosition` | 获取位置 |
| `setPosition(x, y)` | `number, number` | `void` | 设置位置 |
| `move(deltaX, deltaY)` | `number, number` | `void` | 移动节点 |

#### 样式方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getStyle()` | - | `NodeStyle` | 获取样式 |
| `updateStyle(style)` | `Partial<NodeStyle>` | `void` | 更新样式 |
| `setStyle(style)` | `Partial<NodeStyle>` | `void` | 设置样式（同 updateStyle） |

#### 形状方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getShapeConfig()` | - | `ShapeConfig` | 获取形状配置 |
| `setShapeConfig(shape)` | `Shape \| ShapeConfig` | `void` | 设置形状配置 |
| `isHtmlNode()` | - | `boolean` | 是否为 HTML 节点 |
| `createHtmlElement(graph)` | `Graph` | `HTMLElement` | 创建 HTML 元素 |
| `removeHtmlElement()` | - | `void` | 移除 HTML 元素 |
| `updateHtmlContent(html)` | `string` | `void` | 更新 HTML 内容 |
| `getHtmlElement()` | - | `HTMLElement \| null` | 获取 HTML 元素 |

#### 类型方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getType()` | - | `'node' \| 'group'` | 获取节点类型 |
| `setType(type)` | `'node' \| 'group'` | `void` | 设置节点类型 |
| `isGroup()` | - | `boolean` | 是否为群组节点 |

#### 连接桩方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getPortManager()` | - | `PortManager` | 获取连接桩管理器 |
| `addPortGroup(options)` | `PortGroupOptions` | `Port[]` | 批量添加连接桩组 |
| `removePortGroup(groupId)` | `string` | `boolean` | 移除连接桩组 |
| `updatePortGroup(groupId, newCount)` | `string, number` | `boolean` | 更新连接桩组数量 |
| `getPortsBySide(position)` | `'top' \| 'right' \| 'bottom' \| 'left'` | `Port[]` | 获取指定侧的所有连接桩 |
| `getPortCountBySide(position)` | `'top' \| 'right' \| 'bottom' \| 'left'` | `number` | 获取指定侧的连接桩数量 |
| `removePort(portId)` | `string` | `boolean` | 移除连接桩 |
| `getPort(portId)` | `string` | `Port \| undefined` | 获取连接桩 |
| `getAllPorts()` | - | `Port[]` | 获取所有连接桩 |
| `getPortByPosition(position)` | `PortPosition` | `Port \| undefined` | 根据位置获取连接桩 |
| `clearPorts()` | - | `void` | 清除所有连接桩 |
| `drawAllPorts(ctx)` | `CanvasRenderingContext2D` | `void` | 绘制所有连接桩 |
| `getPortConnectionPoint(portId)` | `string` | `{x,y} \| null` | 获取连接桩的连接点坐标 |
| `getPortAtPoint(point)` | `{x,y}` | `Port \| null` | 获取指定点处的连接桩 |

#### 锚点方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getAnchorPoint(position)` | `'top' \| 'right' \| 'bottom' \| 'left' \| 'center'` | `{x,y}` | 获取锚点坐标 |
| `drawAllAnchors(ctx)` | `CanvasRenderingContext2D` | `void` | 绘制所有锚点 |

#### Resize 相关方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setResizable(resizable)` | `boolean` | `void` | 设置是否可调整大小 |
| `setPortsAlwaysVisible(visible)` | `boolean` | `void` | 设置连接桩是否始终可见 |
| `getBounds()` | - | `{x,y,width,height}` | 获取边界框 |
| `containsPoint(point)` | `{x,y}` | `boolean` | 检查点是否在节点内 |
| `getResizeHandlePositions()` | - | `ResizeHandlePosition[]` | 获取 resize handle 位置列表 |
| `getResizeHandlePoint(position, handleSize?)` | `ResizeHandlePosition, number` | `{x,y}` | 获取 resize handle 坐标 |
| `drawResizeHandles(ctx, config?)` | `CanvasRenderingContext2D, Partial<ResizeHandleConfig>` | `void` | 绘制 resize handles |
| `getResizeHandleAtPoint(point)` | `{x,y}` | `ResizeHandlePosition \| null` | 获取点处的 resize handle |
| `calculateResize(handle, deltaX, deltaY, minWidth, minHeight, startBounds)` | `ResizeHandlePosition, number, number, number, number, Bounds` | `{x,y,width,height,changed}` | 计算 resize 结果 |

#### 其他方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `draw(ctx, time?)` | `CanvasRenderingContext2D, number?` | `void` | 绘制节点 |
| `setZIndex(zIndex)` | `number` | `void` | 设置层级（覆盖父类） |
| `hitTest(point)` | `{x,y}` | `{hit,target,port?}` | 碰撞检测 |
| `toJSON()` | - | `NodeData` | 序列化为 JSON |
| `fromJSON(data)` | `NodeData` | `Node` | 从 JSON 反序列化（静态） |
| `clone(newId?)` | `string?` | `Node` | 克隆节点 |

---

### DynamicHeightNode

DynamicHeightNode 是动态高度节点，继承自 Node，支持多行布局和左右连接桩。

#### 构造函数

```typescript
constructor(options: DynamicHeightNodeOptions)
```

#### 配置选项 (DynamicHeightNodeOptions)

继承 `NodeOptions`，额外属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `rows` | `RowConfig[]` | 行配置数组 |
| `style` | `Partial<DynamicHeightNodeStyle>` | 扩展样式 |

#### 行配置 (RowConfig)

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 行 ID（必需） |
| `label` | `string` | 行标签 |
| `leftPort` | `{ id?, style?, lable?, lablePosition? }` | 左侧连接桩配置 |
| `rightPort` | `{ id?, style?, lable?, lablePosition? }` | 右侧连接桩配置 |

#### 样式 (DynamicHeightNodeStyle)

继承 `NodeStyle`，额外属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `rowHeight` | `number` | 行高 |
| `headerHeight` | `number` | 头部高度 |
| `footerPadding` | `number` | 底部内边距 |
| `rowSpacing` | `number` | 行间距 |
| `rowBackgroundColor` | `string` | 行背景色 |
| `rowHoverBackgroundColor` | `string` | 行悬停背景色 |
| `rowBorderColor` | `string` | 行边框色 |
| `rowBorderWidth` | `number` | 行边框宽 |
| `rowBorderRadius` | `number` | 行圆角 |

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getExtendedStyle()` | - | `DynamicHeightNodeStyle` | 获取扩展样式 |
| `updateExtendedStyle(style)` | `Partial<DynamicHeightNodeStyle>` | `void` | 更新扩展样式 |
| `getRows()` | - | `RowConfig[]` | 获取行配置 |
| `getRowData(rowId)` | `string` | `RowData \| undefined` | 获取行数据 |
| `addRow(config, index?)` | `RowConfig, number?` | `void` | 添加行 |
| `removeRow(rowId)` | `string` | `boolean` | 移除行 |
| `updateRow(rowId, updates)` | `string, Partial<RowConfig>` | `boolean` | 更新行 |
| `getRowCount()` | - | `number` | 获取行数 |
| `getRowPortId(rowId, side)` | `string, 'left' \| 'right'` | `string \| undefined` | 获取行连接桩 ID |
| `getRowPort(rowId, side)` | `string, 'left' \| 'right'` | `Port \| undefined` | 获取行连接桩 |
| `isLeftPort(portId)` | `string` | `boolean` | 是否为左侧连接桩 |
| `isRightPort(portId)` | `string` | `boolean` | 是否为右侧连接桩 |
| `getRowIndexAtPoint(point)` | `{x,y}` | `number` | 获取点处的行索引 |
| `getRowIdAtPoint(point)` | `{x,y}` | `string \| undefined` | 获取点处的行 ID |
| `setHoveredRow(index)` | `number` | `void` | 设置悬停行 |
| `getHoveredRow()` | - | `number` | 获取悬停行索引 |
| `draw(ctx)` | `CanvasRenderingContext2D` | `void` | 绘制节点（覆盖） |
| `toJSON()` | - | `DynamicHeightNodeData` | 序列化（覆盖） |
| `fromJSON(data)` | `DynamicHeightNodeData` | `DynamicHeightNode` | 反序列化（静态） |
| `clone(newId?)` | `string?` | `DynamicHeightNode` | 克隆（覆盖） |

---

### Edge

Edge 是边类，继承自 Cell，支持多种边类型和样式。

#### 构造函数

```typescript
constructor(options: EdgeOptions)
```

#### 配置选项 (EdgeOptions)

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 边 ID（必需） |
| `source` | `string \| EdgeAnchor` | 源节点 ID 或锚点 |
| `target` | `string \| EdgeAnchor` | 目标节点 ID 或锚点 |
| `type` | `EdgeType` | 边类型 |
| `label` | `string` | 标签文字 |
| `style` | `Partial<EdgeStyle>` | 边样式 |
| `data` | `Record<string, any>` | 自定义数据 |
| `zIndex` | `number` | 层级索引 |
| `visible` | `boolean` | 是否可见 |

#### 边类型 (EdgeType)

| 类型 | 说明 |
|------|------|
| `Straight` | 直线 |
| `Horizontal` | 水平折线 |
| `Vertical` | 垂直折线 |
| `Bezier` | 贝塞尔曲线 |
| `Arc` | 弧度曲线 |
| `StepRight` | 阶梯折线（先水平后垂直） |
| `StepDown` | 阶梯折线（先垂直后水平） |
| `RoundedStepRight` | 圆角阶梯折线（先水平后垂直） |
| `RoundedStepDown` | 圆角阶梯折线（先垂直后水平） |
| `SmoothStep` | 平滑 L 型折线（正交圆角） |
| `Orthogonal` | 正交折线（智能路由） |
| `DashedStep` | 虚线阶梯折线 |
| `DashedRounded` | 虚线圆角折线 |
| `JumpLine` | 跳线（带交叉跳线效果的直线） |

#### 样式 (EdgeStyle)

| 属性 | 类型 | 说明 |
|------|------|------|
| `stroke` | `string` | 线条颜色 |
| `strokeWidth` | `number` | 线条宽度 |
| `dashed` | `boolean` | 是否为虚线 |
| `dashPattern` | `[number, number]` | 虚线模式 |
| `arrowSize` | `number` | 箭头大小（0 表示无箭头） |
| `arrowColor` | `string` | 箭头颜色 |
| `selectedStroke` | `string` | 选中状态颜色 |
| `selectedStrokeWidth` | `number` | 选中状态宽度 |
| `hoverStroke` | `string` | 悬停状态颜色 |
| `cornerRadius` | `number` | 圆角半径（用于折线） |
| `animated` | `boolean` | 是否启用流动波浪效果 |
| `waveColor` | `string` | 波浪颜色 |
| `waveWidth` | `number` | 波浪宽度 |
| `waveLength` | `number` | 波浪长度 |
| `waveSpeed` | `number` | 波浪流动速度（像素/帧） |
| `waveOpacity` | `number` | 波浪透明度 |
| `jumpHeight` | `number` | 跳线高度 |
| `jumpWidth` | `number` | 跳线宽度 |

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getSourceId()` | - | `string` | 获取源节点 ID |
| `getTargetId()` | - | `string` | 获取目标节点 ID |
| `getSourceAnchor()` | - | `EdgeAnchor` | 获取源锚点 |
| `getTargetAnchor()` | - | `EdgeAnchor` | 获取目标锚点 |
| `getSource()` | - | `EdgeAnchor` | 获取源（同 getSourceAnchor） |
| `getTarget()` | - | `EdgeAnchor` | 获取目标（同 getTargetAnchor） |
| `getType()` | - | `EdgeType` | 获取边类型 |
| `setType(type)` | `EdgeType` | `void` | 设置边类型 |
| `getOffset()` | - | `Point` | 获取偏移量 |
| `setOffset(x, y)` | `number, number` | `void` | 设置偏移量 |
| `updateOffset(deltaX, deltaY)` | `number, number` | `void` | 更新偏移量 |
| `resetOffset()` | - | `void` | 重置偏移量 |
| `getStyle()` | - | `EdgeStyle` | 获取样式 |
| `updateStyle(style)` | `Partial<EdgeStyle>` | `void` | 更新样式 |
| `setStyle(style)` | `Partial<EdgeStyle>` | `void` | 设置样式 |
| `draw(ctx, sourcePoint, targetPoint, time?)` | `CanvasRenderingContext2D, Point, Point, number?` | `void` | 绘制边 |
| `startAnimation(waveOptions?)` | `Partial<Pick<EdgeStyle, 'waveColor' \| 'waveWidth' \| 'waveLength' \| 'waveSpeed' \| 'waveOpacity'>>` | `boolean` | 启动动画 |
| `stopAnimation()` | - | `boolean` | 停止动画 |
| `isAnimationPlaying()` | - | `boolean` | 检查动画是否播放中 |
| `disconnect()` | - | `boolean` | 断开边连接 |
| `isConnected()` | - | `boolean` | 检查是否已连接 |
| `setJumpPoints(points)` | `Point[]` | `void` | 设置跳线点位置 |
| `getJumpPoints()` | - | `Point[]` | 获取跳线点位置 |
| `reconnect()` | - | `boolean` | 重新连接边 |
| `containsPoint(point, tolerance?)` | `Point, number?` | `boolean` | 检查点是否在边上 |
| `toJSON()` | - | `EdgeData` | 序列化为 JSON |
| `fromJSON(data)` | `EdgeData` | `Edge` | 从 JSON 反序列化（静态） |
| `clone(newId?)` | `string?` | `Edge` | 克隆边 |

---

### Port

Port 是连接桩类，继承自 Cell，用于节点之间的连接。

#### 构造函数

```typescript
constructor(options: PortOptions)
```

#### 配置选项 (PortOptions)

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 连接桩 ID（必需） |
| `nodeId` | `string` | 所属节点 ID（必需） |
| `position` | `PortPosition` | 连接桩位置（必需） |
| `visible` | `boolean` | 是否可见 |
| `style` | `Partial<PortStyle>` | 连接桩样式 |
| `shape` | `Shape \| ShapeConfig` | 形状配置 |
| `lable` | `string` | 连接桩标签 |
| `lablePosition` | `'inside' \| 'outside' \| 'top' \| 'bottom'` | 标签位置 |
| `snapDistance` | `number` | 吸附距离 |

#### 位置类型 (PortPosition)

```typescript
type PortPosition = 'top' | 'right' | 'bottom' | 'left' | 'center' | { x: number; y: number };
```

#### 样式 (PortStyle)

| 属性 | 类型 | 说明 |
|------|------|------|
| `width` | `number` | 宽度/直径 |
| `height` | `number` | 高度（用于非圆形） |
| `fillColor` | `string` | 填充颜色 |
| `strokeColor` | `string` | 边框颜色 |
| `strokeWidth` | `number` | 边框宽度 |
| `hoverFillColor` | `string` | 悬停填充颜色 |
| `hoverStrokeColor` | `string` | 悬停边框颜色 |
| `selectedFillColor` | `string` | 选中填充颜色 |
| `selectedStrokeColor` | `string` | 选中边框颜色 |
| `backgroundColor` | `string` | 背景色 |
| `snapDistance` | `number` | 吸附距离 |

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getNodeId()` | - | `string` | 获取所属节点 ID |
| `getPosition()` | - | `PortPosition` | 获取位置 |
| `setPosition(position)` | `PortPosition` | `void` | 设置位置 |
| `getVisible()` | - | `boolean` | 获取可见性 |
| `setVisible(visible)` | `boolean` | `void` | 设置可见性 |
| `isPortVisible()` | - | `boolean` | 检查是否可见 |
| `getPortLabel()` | - | `string \| undefined` | 获取标签 |
| `setPortLabel(label)` | `string \| undefined` | `void` | 设置标签 |
| `getPortLabelPosition()` | - | `'inside' \| 'outside' \| 'top' \| 'bottom'` | 获取标签位置 |
| `setPortLabelPosition(position)` | `'inside' \| 'outside' \| 'top' \| 'bottom'` | `void` | 设置标签位置 |
| `getStyle()` | - | `PortStyle` | 获取样式 |
| `updateStyle(style)` | `Partial<PortStyle>` | `void` | 更新样式 |
| `getShapeConfig()` | - | `ShapeConfig` | 获取形状配置 |
| `setShapeConfig(shape)` | `Shape \| ShapeConfig` | `void` | 设置形状配置 |
| `getSnapDistance()` | - | `number` | 获取吸附距离 |
| `setSnapDistance(distance)` | `number` | `void` | 设置吸附距离 |
| `getConnectionPoint(nodeX, nodeY, nodeWidth, nodeHeight)` | `number, number, number, number` | `{x,y}` | 获取连接点坐标 |
| `getDistanceToPoint(point, nodeX, nodeY, nodeWidth, nodeHeight)` | `Point, number, number, number, number` | `number` | 计算到点的距离 |
| `draw(ctx, nodeX, nodeY, nodeWidth, nodeHeight)` | `CanvasRenderingContext2D, number, number, number, number` | `void` | 绘制连接桩 |
| `containsPoint(point, nodeX, nodeY, nodeWidth, nodeHeight)` | `Point, number, number, number, number` | `boolean` | 检查点是否在连接桩内 |
| `toJSON()` | - | `PortData` | 序列化为 JSON |
| `fromJSON(data)` | `PortData` | `Port` | 从 JSON 反序列化（静态） |
| `clone(newId?)` | `string?` | `Port` | 克隆连接桩 |

---

### Cell

Cell 是基础单元抽象类，作为 Node 和 Edge 的基类。

#### 构造函数

```typescript
constructor(options: CellOptions)
```

#### 配置选项 (CellOptions)

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 单元 ID（必需） |
| `label` | `string` | 标签文字 |
| `data` | `Record<string, any>` | 自定义数据 |
| `visible` | `boolean` | 是否可见 |
| `locked` | `boolean` | 是否锁定 |
| `zIndex` | `number` | 层级索引 |

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getId()` | - | `string` | 获取 ID |
| `getLabel()` | - | `string` | 获取标签 |
| `setLabel(label)` | `string` | `void` | 设置标签 |
| `getData()` | - | `Record<string, any>` | 获取数据 |
| `setData(data)` | `Record<string, any>` | `void` | 设置数据 |
| `setSelected(selected)` | `boolean` | `void` | 设置选中状态 |
| `getSelected()` | - | `boolean` | 获取选中状态 |
| `setHovered(hovered)` | `boolean` | `void` | 设置悬停状态 |
| `getHovered()` | - | `boolean` | 获取悬停状态 |
| `setVisible(visible)` | `boolean` | `void` | 设置可见性 |
| `getVisible()` | - | `boolean` | 获取可见性 |
| `setLocked(locked)` | `boolean` | `void` | 设置锁定状态 |
| `getLocked()` | - | `boolean` | 获取锁定状态 |
| `setZIndex(zIndex)` | `number` | `void` | 设置层级 |
| `getZIndex()` | - | `number` | 获取层级 |
| `toggleSelected()` | - | `void` | 切换选中状态 |
| `getClassName()` | - | `string` | 获取 CSS 类名 |
| `on(eventName, handler)` | `string, EventHandler` | `() => void` | 注册事件 |
| `once(eventName, handler)` | `string, EventHandler` | `() => void` | 注册一次性事件 |
| `off(eventName, handler?)` | `string, EventHandler?` | `void` | 注销事件 |
| `emit(eventName, eventData)` | `string, any` | `boolean` | 触发事件 |
| `hasHandlers(eventName)` | `string` | `boolean` | 检查是否有事件处理器 |
| `destroy()` | - | `void` | 销毁（清理事件） |

---

### EventManager

EventManager 是事件管理器类，提供事件的注册、注销和触发功能。

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `on(eventName, handler)` | `string, EventHandler` | `() => void` | 注册事件（返回注销函数） |
| `once(eventName, handler)` | `string, EventHandler` | `() => void` | 注册一次性事件 |
| `off(eventName, handler?)` | `string, EventHandler?` | `void` | 注销事件 |
| `emit(eventName, eventData)` | `string, any` | `boolean` | 触发事件 |
| `hasHandlers(eventName)` | `string` | `boolean` | 检查是否有处理器 |
| `getHandlerCount(eventName)` | `string` | `number` | 获取处理器数量 |
| `clear()` | - | `void` | 清除所有处理器 |
| `offByNamespace(namespace)` | `string` | `void` | 按命名空间注销 |

#### Eventful 类

Eventful 是支持事件的基类，内部使用 EventManager。

| 方法 | 说明 |
|------|------|
| `on(eventName, handler)` | 注册事件 |
| `once(eventName, handler)` | 注册一次性事件 |
| `off(eventName, handler?)` | 注销事件 |
| `emit(eventName, eventData)` | 触发事件 |
| `hasHandlers(eventName)` | 检查是否有处理器 |
| `destroy()` | 销毁（清理事件） |

---

## 插件系统

### 插件接口 (Plugin)

```typescript
interface Plugin {
    name: string;
    install(graph: Graph): void;
    uninstall?(): void;
}
```

### 内置插件

| 插件 | 导出路径 | 说明 |
|------|----------|------|
| `Dnd` | `./plugins/Dnd` | 拖拽插件 |
| `ReactShape` | `./plugins/ReactShape` | React 形状插件 |
| `Snapline` | `./plugins/Snapline` | 对齐线插件 |
| `Clipboard` | `./plugins/Clipboard` | 剪贴板插件 |
| `MiniMap` | `./plugins/MiniMap` | 小地图插件 |
| `SiderPane` | `./plugins/SiderPane` | 侧边栏插件 |
| `Dropdown` | `./plugins/Dropdown` | 下拉菜单插件 |
| `History` | `./plugins/History` | 历史记录插件 |
| `Selection` | `./plugins/Selection` | 框选插件 |
| `Export` | `./plugins/Export` | 导出插件 |
| `Tools` | `./plugins/Tools` | 工具栏插件 |
| `ForceDirected` | `./plugins/ForceDirected` | 力导向布局插件 |
| `Context` | `./plugins/Context` | 上下文插件 |
| `GroupCell` | `./plugins/GroupCell` | 群组插件 |

---

## 类型定义

### 基础类型

```typescript
interface Point {
    x: number;
    y: number;
}

interface NodePosition extends Point {}

interface EdgeAnchor {
    nodeId: string;
    portId?: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
}
```

### 节点样式 (NodeStyle)

```typescript
interface NodeStyle {
    width: number;
    height: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    borderStyle: 'solid' | 'dashed' | 'animated';
    dashPattern: [number, number];
    animatedBorderColor: string;
    animatedDashPattern: [number, number];
    animatedBorderSpeed: number;
    textColor: string;
    fontSize: number;
    fontFamily: string;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    selectedBorderColor: string;
    selectedBorderWidth: number;
    hoverBackgroundColor: string;
}
```

### Resize Handle

```typescript
type ResizeHandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface ResizeHandleConfig {
    position: ResizeHandlePosition;
    size: number;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
}
```

### 形状

```typescript
enum Shape {
    Rect = 'rect',
    Circle = 'circle',
    Ellipse = 'ellipse',
    Polygon = 'polygon',
    Polyline = 'polyline',
    Path = 'path',
    Image = 'image',
    HTML = 'html',
}

interface ShapeConfig {
    type: Shape;
    borderRadius?: number;
    points?: { x: number; y: number }[];
    path?: string;
    src?: string;
    html?: string;
}
```

### 连接验证

```typescript
interface ConnectionValidateContext {
    sourceNode: Node;
    sourcePort: Port;
    targetNode: Node;
    targetPort: Port;
}

type ConnectionValidator = (context: ConnectionValidateContext) => boolean;
```

---

## 事件列表

### Cell 事件

| 事件名 | 说明 |
|--------|------|
| `cell:click` | 单击 |
| `cell:dblclick` | 双击 |
| `cell:contextmenu` | 右键 |
| `cell:mousedown` | 鼠标按下 |
| `cell:mousemove` | 鼠标移动 |
| `cell:mouseup` | 鼠标抬起 |
| `cell:mousewheel` | 鼠标滚轮 |
| `cell:mouseenter` | 鼠标进入 |
| `cell:mouseleave` | 鼠标离开 |

### Node 事件

| 事件名 | 说明 |
|--------|------|
| `node:click` | 单击 |
| `node:dblclick` | 双击 |
| `node:contextmenu` | 右键 |
| `node:mousedown` | 鼠标按下 |
| `node:mousemove` | 鼠标移动 |
| `node:mouseup` | 鼠标抬起 |
| `node:mousewheel` | 鼠标滚轮 |
| `node:mouseenter` | 鼠标进入 |
| `node:mouseleave` | 鼠标离开 |
| `node:dragstart` | 拖拽开始 |
| `node:drag` | 拖拽中 |
| `node:dragend` | 拖拽结束 |
| `node:selected` | 选中 |
| `node:unselected` | 取消选中 |
| `node:add` | 节点添加 |
| `node:remove` | 节点移除 |
| `node:resize` | 调整大小中 |
| `node:resizestart` | 调整大小开始 |
| `node:resizeend` | 调整大小结束 |

### Port 事件

| 事件名 | 说明 |
|--------|------|
| `node:port:click` | 单击 |
| `node:port:dblclick` | 双击 |
| `node:port:contextmenu` | 右键 |
| `node:port:mousedown` | 鼠标按下 |
| `node:port:mousemove` | 鼠标移动 |
| `node:port:mouseup` | 鼠标抬起 |
| `node:port:mouseenter` | 鼠标进入 |
| `node:port:mouseleave` | 鼠标离开 |

### Edge 事件

| 事件名 | 说明 |
|--------|------|
| `edge:click` | 单击 |
| `edge:dblclick` | 双击 |
| `edge:contextmenu` | 右键 |
| `edge:mousedown` | 鼠标按下 |
| `edge:mousemove` | 鼠标移动 |
| `edge:mouseup` | 鼠标抬起 |
| `edge:mouseenter` | 鼠标进入 |
| `edge:mouseleave` | 鼠标离开 |
| `edge:add` | 边添加 |
| `edge:remove` | 边移除 |

### 空白区域事件

| 事件名 | 说明 |
|--------|------|
| `blank:click` | 单击 |
| `blank:dblclick` | 双击 |
| `blank:contextmenu` | 右键 |
| `blank:mousedown` | 鼠标按下 |
| `blank:mousemove` | 鼠标移动 |
| `blank:mouseup` | 鼠标抬起 |
| `blank:mousewheel` | 鼠标滚轮 |

---

## 导出汇总

### 核心模块 (`src/core`)

```typescript
// Graph
export { Graph, type GraphOptions, type GraphState, type Point, type ConnectionValidateContext, type ConnectionValidator } from './Graph';

// Node
export { Node, type NodeOptions, type NodeStyle, type NodePosition, type NodeData, type NodeEvent, type ResizeHandlePosition, type ResizeHandleConfig, DEFAULT_RESIZE_HANDLE_CONFIG } from './Node';

// DynamicHeightNode
export { DynamicHeightNode, type DynamicHeightNodeOptions, type DynamicHeightNodeStyle, type DynamicHeightNodeData, type DynamicHeightNodeEvent, type RowConfig, type RowData } from './DynamicNode';

// Edge
export { Edge, EdgeType, type EdgeOptions, type EdgeStyle, type EdgeAnchor, type EdgeData, type EdgeEvent } from './Edge';

// Port
export { Port, type PortOptions, type PortStyle, type PortPosition, type PortData, type PortEvent, type PortLayoutConfig, type PortGroupOptions } from './Port';

// Shape
export { Shape, type ShapeConfig, ShapeRenderer } from './Shape';

// Cell
export { type CellOptions, type CellData, type CellEvent, type BaseStyle, Cell } from './Cell';

// EventManager
export { EventManager, Eventful, EVENT_NAMES, type EventHandler, type EventName, type BaseEvent, type MouseEvent, type WheelEvent, type IEventful } from './EventManager';
```

### 插件模块 (`src/plugins`)

```typescript
export { Dnd, type DndOptions, type DndSourceConfig, type DndEvent, type Plugin } from './Dnd';
export { ReactShape, ReactShapeNode, registerReactShape, unregisterReactShape, getGlobalReactShape, hasGlobalReactShape, getGlobalReactShapes, isReactShape, addReactNode, type ReactNodeProps, type ReactShapeConfig, type ReactShapePortConfig } from './ReactShape';
export { Snapline, type SnaplineOptions, type SnaplineType, type SnaplineData, type SnapPoint } from './Snapline';
export { Clipboard, type ClipboardOptions, type ClipboardData, type NodeClipboardData, type EdgeClipboardData } from './Clipboard';
export { MiniMap, type MiniMapOptions, type MiniMapPosition } from './MiniMap';
export { SiderPane, type SiderPaneOptions } from './SiderPane';
export { Dropdown, createDropdown, type DropdownOptions, type MenuItem } from './Dropdown';
export { History, type HistoryOptions, type HistoryAction, type HistoryActionType, type HistoryState, type BatchHistoryAction } from './History';
export { Selection, type SelectionOptions, type SelectionEvent } from './Selection';
export { Export, type ExportOptions, type ExportFormat, type SVGExportOptions } from './Export';
export { Tools, type ToolsOptions, type SearchResults } from './Tools';
export { ForceDirected, type ForceDirectedOptions } from './ForceDirected';
```

---

## 使用示例

### 基础用法

```typescript
import { Graph, Node, Edge, EdgeType } from 'graph-flow';

// 创建画布
const graph = new Graph({
    container: document.getElementById('canvas'),
    width: 800,
    height: 600,
});

// 添加节点
const node1 = graph.addNode({
    id: 'node1',
    x: 100,
    y: 100,
    label: '节点 1',
    style: { width: 120, height: 60 },
});

const node2 = graph.addNode({
    id: 'node2',
    x: 300,
    y: 200,
    label: '节点 2',
    style: { width: 120, height: 60 },
});

// 添加边
const edge = graph.addEdge({
    id: 'edge1',
    source: 'node1',
    target: 'node2',
    type: EdgeType.Bezier,
});

// 监听事件
graph.on('node:click', (event) => {
    console.log('点击了节点:', event.node.getId());
});
```

### 使用插件

```typescript
import { Graph, ReactShape, History, Clipboard } from 'graph-flow';

const graph = new Graph({ container: document.getElementById('canvas') });

// 安装插件
graph.use(new ReactShape())
     .use(new History())
     .use(new Clipboard());

// 使用 React 节点
graph.addReactNode({
    shape: 'custom-component',
    x: 200,
    y: 150,
    data: { title: '标题', content: '内容' },
});
```
