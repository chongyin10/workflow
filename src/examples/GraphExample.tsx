import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Anchor, Button } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
} from './components/CodeEditor';
import './styles/panel.css';

// GraphOptions 表格数据
const graphOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const graphOptionsData = [
  { name: 'container', type: 'HTMLElement', required: '是', default: '-', description: '容器元素，Graph 将在此元素内渲染' },
  { name: 'width', type: 'number', required: '否', default: '800', description: '画布宽度' },
  { name: 'height', type: 'number', required: '否', default: '600', description: '画布高度' },
  { name: 'initialOffsetX', type: 'number', required: '否', default: '0', description: '初始 X 轴偏移量' },
  { name: 'initialOffsetY', type: 'number', required: '否', default: '0', description: '初始 Y 轴偏移量' },
  { name: 'minZoom', type: 'number', required: '否', default: '0.1', description: '最小缩放比例' },
  { name: 'maxZoom', type: 'number', required: '否', default: '5', description: '最大缩放比例' },
  { name: 'draggable', type: 'boolean', required: '否', default: 'true', description: '是否启用画布拖拽' },
  { name: 'scalable', type: 'boolean', required: '否', default: 'true', description: '是否启用缩放' },
  { name: 'draggingCursor', type: 'string', required: '否', default: "'grabbing'", description: '拖拽时的光标样式' },
  { name: 'onDragEnd', type: '(offset: Point) => void', required: '否', default: '-', description: '拖拽完成回调函数' },
  { name: 'onZoom', type: '(scale: number, offset: Point) => void', required: '否', default: '-', description: '缩放完成回调函数' },
  { name: 'onNodeSelect', type: '(node: Node | null) => void', required: '否', default: '-', description: '节点选中回调函数' },
  { name: 'backgroundColor', type: 'string', required: '否', default: "'#ffffff'", description: '背景颜色' },
  { name: 'grid.enabled', type: 'boolean', required: '否', default: 'true', description: '是否启用网格' },
  { name: 'grid.size', type: 'number', required: '否', default: '20', description: '网格大小' },
  { name: 'grid.color', type: 'string', required: '否', default: "'#e5e7eb'", description: '网格颜色' },
  { name: 'grid.type', type: "'mesh' | 'dot'", required: '否', default: "'mesh'", description: '网格类型：mesh 为线状网格，dot 为点状网格' },
  { name: 'validateConnection', type: 'ConnectionValidator', required: '否', default: '() => true', description: '连接验证函数，返回 true 允许连接，返回 false 阻止连接' },
];

// Graph 类方法表格数据
const graphMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 200 },
  { title: '参数', dataIndex: 'params', width: 250 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const graphMethodsData = [
  { key: '1', name: 'addNode(options)', params: 'options: NodeOptions', return: 'Node', description: '添加节点到画布，支持普通节点和 React 组件节点（需先安装 ReactShape 插件）' },
  { key: '2', name: 'removeNode(nodeId)', params: 'nodeId: string', return: 'boolean', description: '移除指定节点' },
  { key: '3', name: 'getNode(nodeId)', params: 'nodeId: string', return: 'Node | undefined', description: '获取指定节点' },
  { key: '4', name: 'getAllNodes()', params: '-', return: 'Node[]', description: '获取所有节点' },
  { key: '5', name: 'getSelectedNode()', params: '-', return: 'Node | null', description: '获取当前选中的节点' },
  { key: '6', name: 'selectNode(nodeId)', params: 'nodeId: string | null', return: 'void', description: '选中指定节点' },
  { key: '7', name: 'clearNodes()', params: '-', return: 'void', description: '清除所有节点' },
  { key: '8', name: 'addEdge(options)', params: 'options: EdgeOptions', return: 'Edge', description: '添加边到画布' },
  { key: '9', name: 'removeEdge(edgeId)', params: 'edgeId: string', return: 'boolean', description: '移除指定边' },
  { key: '10', name: 'getEdge(edgeId)', params: 'edgeId: string', return: 'Edge | undefined', description: '获取指定边' },
  { key: '11', name: 'getAllEdges()', params: '-', return: 'Edge[]', description: '获取所有边' },
  { key: '12', name: 'getSelectedEdge()', params: '-', return: 'Edge | null', description: '获取当前选中的边' },
  { key: '13', name: 'selectEdge(edgeId)', params: 'edgeId: string | null', return: 'void', description: '选中指定边' },
  { key: '14', name: 'clearEdges()', params: '-', return: 'void', description: '清除所有边' },
  { key: '15', name: 'clear()', params: '-', return: 'void', description: '清除所有节点和边' },
  { key: '16', name: 'setOffset(offset)', params: 'offset: Point', return: 'void', description: '设置画布偏移量' },
  { key: '17', name: 'setScale(scale)', params: 'scale: number', return: 'void', description: '设置缩放比例' },
  { key: '18', name: 'panTo(offset, duration?, easing?)', params: 'offset: Point, duration?: number, easing?: (t: number) => number', return: 'Promise<void>', description: '平移到指定位置（带动画）' },
  { key: '19', name: 'zoomTo(scale, duration?, easing?)', params: 'scale: number, duration?: number, easing?: (t: number) => number', return: 'Promise<void>', description: '缩放到指定比例（带动画）' },
  { key: '20', name: 'reset()', params: '-', return: 'void', description: '重置视图到初始状态' },
  { key: '21', name: 'resetToCenter()', params: '-', return: 'void', description: '重置视图到画布中心点' },
  { key: '22', name: 'fitToContent(bounds, padding?)', params: 'bounds: { x, y, width, height }, padding?: number', return: 'void', description: '自适应内容到视图' },
  { key: '23', name: 'zoomIn(factor?)', params: 'factor?: number', return: 'void', description: '放大画布，默认因子 1.1' },
  { key: '24', name: 'zoomOut(factor?)', params: 'factor?: number', return: 'void', description: '缩小画布，默认因子 0.9' },
  { key: '25', name: 'getZoom()', params: '-', return: 'number', description: '获取当前缩放比例' },
  { key: '26', name: 'setGridSize(size)', params: 'size: number', return: 'void', description: '设置网格大小' },
  { key: '27', name: 'setGridColor(color)', params: 'color: string', return: 'void', description: '设置网格颜色' },
  { key: '28', name: 'setGridEnabled(enabled)', params: 'enabled: boolean', return: 'void', description: '启用/禁用网格' },
  { key: '29', name: 'getGridConfig()', params: '-', return: '{ enabled, size, color, type }', description: '获取网格配置' },
  { key: '30', name: 'setGridType(type)', params: "type: 'mesh' | 'dot'", return: 'void', description: '设置网格类型' },
  { key: '31', name: 'screenToWorld(point)', params: 'point: Point', return: 'Point', description: '屏幕坐标转世界坐标' },
  { key: '32', name: 'worldToScreen(point)', params: 'point: Point', return: 'Point', description: '世界坐标转屏幕坐标' },
  { key: '33', name: 'toJSON()', params: '-', return: '{ cells: Array }', description: '导出图为 JSON 格式' },
  { key: '34', name: 'destroy()', params: '-', return: 'void', description: '销毁 Graph 实例' },
  { key: '35', name: 'on(eventName, handler)', params: 'eventName: string, handler: EventHandler', return: '() => void', description: '注册事件监听器' },
  { key: '36', name: 'once(eventName, handler)', params: 'eventName: string, handler: EventHandler', return: '() => void', description: '注册一次性事件监听器' },
  { key: '37', name: 'off(eventName, handler?)', params: 'eventName: string, handler?: EventHandler', return: 'void', description: '注销事件监听器' },
  { key: '38', name: 'use(plugin)', params: 'plugin: Plugin', return: 'this', description: '注册插件（如 ReactShape 插件用于支持 React 组件节点）' },
  { key: '39', name: 'unuse(pluginName)', params: 'pluginName: string', return: 'this', description: '注销插件' },
  { key: '40', name: 'hasPlugin(pluginName)', params: 'pluginName: string', return: 'boolean', description: '检查是否已注册指定插件' },
  { key: '41', name: 'getOverlay()', params: '-', return: 'HTMLDivElement', description: '获取 Overlay 层（用于放置 HTML 节点）' },
  { key: '42', name: 'addHtmlNodeElement(nodeId, element)', params: 'nodeId: string, element: HTMLElement', return: 'void', description: '添加 HTML 节点元素到 Overlay 层' },
  { key: '43', name: 'removeHtmlNodeElement(nodeId)', params: 'nodeId: string', return: 'void', description: '移除 HTML 节点元素' },
  { key: '44', name: 'getHtmlNodeElement(nodeId)', params: 'nodeId: string', return: 'HTMLElement | undefined', description: '获取 HTML 节点元素' },
  { key: '45', name: 'updateHtmlNodeTransform(node)', params: 'node: Node', return: 'void', description: '更新 HTML 节点的位置和变换' },
  { key: '46', name: 'syncHtmlNodeTransforms()', params: '-', return: 'void', description: '同步所有 HTML 节点的位置和变换' },
  { key: '47', name: 'setDraggable(enabled)', params: 'enabled: boolean', return: 'void', description: '设置是否启用画布拖拽' },
  { key: '48', name: 'setScalable(enabled)', params: 'enabled: boolean', return: 'void', description: '设置是否启用缩放' },
  { key: '49', name: 'startEdgeAnimation()', params: '-', return: 'void', description: '开始边动画循环' },
  { key: '50', name: 'stopEdgeAnimation()', params: '-', return: 'void', description: '停止边动画循环' },
];

// React Shape 插件方法表格数据
const reactShapeMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 220 },
  { title: '参数', dataIndex: 'params', width: 280 },
  { title: '返回值', dataIndex: 'return', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const reactShapeMethodsData = [
  { key: '1', name: 'register(config)', params: 'config: ReactShapeConfig', return: 'void', description: '注册 React 组件形状（简洁 API，推荐）' },
  { key: '2', name: 'Graph.register(config)', params: 'config: ReactShapeConfig', return: 'void', description: '静态方法注册 React 组件形状' },
  { key: '3', name: 'reactShapePlugin.register(config)', params: 'config: ReactShapeConfig', return: 'void', description: '通过插件实例注册 React 组件形状' },
  { key: '4', name: 'addReactNode(graph, options)', params: 'graph: Graph, options: NodeOptions', return: 'ReactShapeNode | null', description: '辅助函数添加 React 节点（传统方式）' },
];

// ReactShapeConfig 配置表格数据
const reactShapeConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const reactShapeConfigData = [
  { name: 'shape', type: 'string', required: '是', default: '-', description: '形状名称（唯一标识）' },
  { name: 'width', type: 'number', required: '否', default: '200', description: '节点默认宽度' },
  { name: 'height', type: 'number', required: '否', default: '100', description: '节点默认高度' },
  { name: 'component', type: 'React.ComponentType', required: '是', default: '-', description: 'React 组件，接收 ReactNodeProps 参数' },
  { name: 'style', type: 'Partial<NodeStyle>', required: '否', default: '{}', description: '节点样式配置' },
  { name: 'resizable', type: 'boolean', required: '否', default: 'false', description: '是否可调整大小' },
  { name: 'ports', type: 'ReactShapePortConfig[]', required: '否', default: '[]', description: '连接桩配置数组' },
];

// ReactNodeProps 属性表格数据
const reactNodePropsColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 220 },
  { title: '说明', dataIndex: 'description' },
];

const reactNodePropsData = [
  { name: 'nodeId', type: 'string', description: '节点 ID' },
  { name: 'data', type: 'Record<string, any>', description: '节点自定义数据' },
  { name: 'position', type: '{ x: number; y: number }', description: '节点位置坐标' },
  { name: 'selected', type: 'boolean', description: '节点是否被选中' },
  { name: 'hovered', type: 'boolean', description: '节点是否悬停' },
  { name: 'graph', type: 'Graph', description: 'Graph 实例引用' },
  { name: 'node', type: 'ReactShapeNode', description: '节点实例引用' },
];

// Graph 事件表格数据
const graphEventColumns = [
  { title: '事件名称', dataIndex: 'name', width: 260 },
  { title: '触发时机', dataIndex: 'trigger', width: 180 },
  { title: '事件参数', dataIndex: 'params', width: 280 },
  { title: '说明', dataIndex: 'description' },
];

const graphEventData = [
  { name: 'blank:click', trigger: '点击空白', params: '{ x, y, clientX, clientY, originalEvent }', description: '在画布空白区域点击时触发' },
  { name: 'blank:contextmenu', trigger: '右键空白', params: '{ x, y, clientX, clientY, originalEvent }', description: '在画布空白区域右键时触发' },
  { name: 'node:selected', trigger: '节点选中', params: '{ node, type }', description: '节点被选中时触发' },
  { name: 'node:unselected', trigger: '取消选中', params: '{ node, type }', description: '节点取消选中时触发' },
  { name: 'node:click', trigger: '点击节点', params: '{ node, originalEvent }', description: '点击节点时触发' },
  { name: 'node:dblclick', trigger: '双击节点', params: '{ node, originalEvent }', description: '双击节点时触发' },
  { name: 'node:dragstart', trigger: '开始拖拽', params: '{ node, x, y }', description: '开始拖拽节点时触发' },
  { name: 'node:drag', trigger: '拖拽中', params: '{ node, x, y }', description: '节点拖拽过程中触发' },
  { name: 'node:dragend', trigger: '拖拽结束', params: '{ node, x, y }', description: '节点拖拽结束时触发' },
  { name: 'edge:added', trigger: '边添加', params: '{ edge }', description: '添加边时触发' },
  { name: 'edge:removed', trigger: '边移除', params: '{ edge }', description: '移除边时触发' },
  { name: 'edge:click', trigger: '点击边', params: '{ edge, originalEvent }', description: '点击边时触发' },
];

// 示例 1: 基础 Graph 示例
const EXAMPLE_1_CODE = `// 示例 1: 基础 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: {
    enabled: true,
    size: 20,
    color: '#e2e8f0',
  },
  onNodeSelect: (node) => {
    console.log('选中节点:', node?.getId());
  },
});

// 开始节点 - 圆形
const startNode = graph.addNode({
  id: 'node-start',
  label: '开始',
  x: 150,
  y: 200,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
    hoverBackgroundColor: '#4ade80',
  },
});

// 处理节点 - 矩形
// 演示 portsAlwaysVisible: false，仅在悬停时显示连接桩
const processNode = graph.addNode({
  id: 'node-process',
  label: '处理（悬停显示连接桩）',
  x: 300,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 160,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    borderRadius: 8,
    textColor: '#ffffff',
    hoverBackgroundColor: '#60a5fa',
  },
  portsAlwaysVisible: false, // 设置为 false，仅在鼠标悬停时显示连接桩
});

// 结束节点 - 圆形
const endNode = graph.addNode({
  id: 'node-end',
  label: '结束',
  x: 450,
  y: 200,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
    hoverBackgroundColor: '#f87171',
  },
});

// 添加连接桩
startNode.addPort({
  id: 'port-start-right',
  position: 'right',
  visible: true,
});

processNode.addPort({
  id: 'port-process-left',
  position: 'left',
  visible: true,
});

processNode.addPort({
  id: 'port-process-right',
  position: 'right',
  visible: true,
});

endNode.addPort({
  id: 'port-end-left',
  position: 'left',
  visible: true,
});

// 直线连接
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-start', portId: 'port-start-right' },
  target: { nodeId: 'node-process', portId: 'port-process-left' },
  type: EdgeType.Straight,
  style: {
    stroke: '#64748b',
    strokeWidth: 2,
    arrowSize: 10,
  },
});

// 贝塞尔曲线
graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'node-process', portId: 'port-process-right' },
  target: { nodeId: 'node-end', portId: 'port-end-left' },
  type: EdgeType.Bezier,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 2,
    arrowSize: 8,
  },
});

console.log('基础 Graph 示例已加载');
console.log('可拖拽画布、滚轮缩放、选中节点');`;

// 示例 2: 缩放控制
const EXAMPLE_2_CODE = `// 示例 2: 缩放控制 (zoomIn, zoomOut, getZoom)
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
  minZoom: 0.3,
  maxZoom: 3,
});

// 创建一些节点用于演示缩放效果
const nodes = [
  { id: 'node-1', label: '节点 1', x: 200, y: 150, color: '#22c55e' },
  { id: 'node-2', label: '节点 2', x: 350, y: 100, color: '#3b82f6' },
  { id: 'node-3', label: '节点 3', x: 350, y: 250, color: '#f59e0b' },
  { id: 'node-4', label: '节点 4', x: 500, y: 150, color: '#ef4444' },
];

nodes.forEach((n) => {
  graph.addNode({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    shape: Shape.Circle,
    style: {
      width: 70,
      height: 70,
      backgroundColor: n.color,
      textColor: '#ffffff',
    },
  });
});

// 添加边
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-1', portId: 'port-right' },
  target: { nodeId: 'node-2', portId: 'port-left' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'node-1', portId: 'port-right' },
  target: { nodeId: 'node-3', portId: 'port-left' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-3',
  source: { nodeId: 'node-2', portId: 'port-right' },
  target: { nodeId: 'node-4', portId: 'port-left' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-4',
  source: { nodeId: 'node-3', portId: 'port-right' },
  target: { nodeId: 'node-4', portId: 'port-left' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

// 添加控制按钮
const controls = document.createElement('div');
controls.style.cssText = 'position:absolute;top:12px;right:12px;display:flex;gap:8px;background:#1e293b;padding:8px 12px;borderRadius:8px;boxShadow:0 2px 8px rgba(0,0,0,0.15);';

const zoomInBtn = document.createElement('button');
zoomInBtn.textContent = '🔍 +';
zoomInBtn.style.cssText = 'padding:6px 12px;background:#3b82f6;color:#fff;border:none;borderRadius:4px;cursor:pointer;fontSize:13px;fontWeight:500;';
zoomInBtn.onclick = () => {
  graph.zoomIn();
  updateZoomDisplay();
};

const zoomOutBtn = document.createElement('button');
zoomOutBtn.textContent = '🔍 -';
zoomOutBtn.style.cssText = 'padding:6px 12px;background:#3b82f6;color:#fff;border:none;borderRadius:4px;cursor:pointer;fontSize:13px;fontWeight:500;';
zoomOutBtn.onclick = () => {
  graph.zoomOut();
  updateZoomDisplay();
};

const zoomDisplay = document.createElement('span');
zoomDisplay.style.cssText = 'padding:6px 12px;background:#334155;color:#e2e8f0;borderRadius:4px;fontSize:13px;fontFamily:monospace;minWidth:60px;textAlign:center;';

function updateZoomDisplay() {
  zoomDisplay.textContent = Math.round(graph.getZoom() * 100) + '%';
}

controls.appendChild(zoomOutBtn);
controls.appendChild(zoomDisplay);
controls.appendChild(zoomInBtn);
container.appendChild(controls);

// 初始化显示
updateZoomDisplay();

// 监听缩放变化
graph.on('zoom', () => {
  updateZoomDisplay();
});

console.log('缩放控制示例');
console.log('- zoomIn(factor?): 放大，默认 1.1');
console.log('- zoomOut(factor?): 缩小，默认 0.9');
console.log('- getZoom(): 获取当前缩放比例');`;

// 示例 3: 网格配置
const EXAMPLE_3_CODE = `// 示例 3: 网格配置 (setGridSize, setGridColor, setGridEnabled, getGridConfig)
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#0f172a',
  grid: {
    enabled: true,
    size: 40,
    color: '#1e293b',
  },
});

// 创建一些节点
const positions = [
  { x: 200, y: 150, label: '小', color: '#22c55e' },
  { x: 300, y: 150, label: '网', color: '#3b82f6' },
  { x: 400, y: 150, label: '格', color: '#f59e0b' },
];

positions.forEach((p, i) => {
  graph.addNode({
    id: \`node-\${i}\`,
    label: p.label,
    x: p.x,
    y: p.y,
    shape: Shape.Circle,
    style: {
      width: 60,
      height: 60,
      backgroundColor: p.color,
      textColor: '#ffffff',
    },
  });
});

// 添加控制面板
const panel = document.createElement('div');
panel.style.cssText = 'position:absolute;top:12px;right:12px;background:#1e293b;padding:12px;borderRadius:8px;boxShadow:0 2px 8px rgba(0,0,0,0.15);color:#e2e8f0;minWidth:180px;';

// 网格大小控制
const sizeControl = document.createElement('div');
sizeControl.style.cssText = 'marginBottom:12px;';
sizeControl.innerHTML = '<div style="fontSize:12px;marginBottom:6px;color:#94a3b8;">网格大小</div>';

const sizeSlider = document.createElement('input');
sizeSlider.type = 'range';
sizeSlider.min = '10';
sizeSlider.max = '60';
sizeSlider.value = '40';
sizeSlider.style.cssText = 'width:100%;cursor:pointer;';
sizeSlider.oninput = (e) => {
  const size = parseInt(e.target.value);
  graph.setGridSize(size);
  updateConfigDisplay();
};
sizeControl.appendChild(sizeSlider);
panel.appendChild(sizeControl);

// 颜色选择
const colorControl = document.createElement('div');
colorControl.style.cssText = 'marginBottom:12px;';
colorControl.innerHTML = '<div style="fontSize:12px;marginBottom:6px;color:#94a3b8;">网格颜色</div>';

const colors = ['#1e293b', '#334155', '#94a3b8', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
const colorButtons = document.createElement('div');
colorButtons.style.cssText = 'display:flex;gap:6px;flexWrap:wrap;';

colors.forEach((color) => {
  const btn = document.createElement('button');
  btn.style.cssText = \`width:24px;height:24px;borderRadius:4px;border:none;cursor:pointer;background:\${color};\`;
  btn.onclick = () => {
    graph.setGridColor(color);
    updateConfigDisplay();
  };
  colorButtons.appendChild(btn);
});
colorControl.appendChild(colorButtons);
panel.appendChild(colorControl);

// 显示/隐藏网格
const toggleControl = document.createElement('div');
toggleControl.style.cssText = 'display:flex;alignItems:center;gap:8px;marginBottom:12px;';

const toggleCheckbox = document.createElement('input');
toggleCheckbox.type = 'checkbox';
toggleCheckbox.checked = true;
toggleCheckbox.onchange = (e) => {
  graph.setGridEnabled(e.target.checked);
  updateConfigDisplay();
};

toggleControl.appendChild(toggleCheckbox);
toggleControl.appendChild(document.createTextNode('显示网格'));
panel.appendChild(toggleControl);

// 配置信息显示
const configDisplay = document.createElement('div');
configDisplay.style.cssText = 'fontSize:12px;color:#64748b;fontFamily:monospace;borderTop:1px solid #334155;paddingTop:8px;marginTop:8px;';

function updateConfigDisplay() {
  const config = graph.getGridConfig();
  configDisplay.innerHTML = \`
    enabled: \${config.enabled}<br>
    size: \${config.size}<br>
    color: \${config.color}
  \`;
}
panel.appendChild(configDisplay);

container.appendChild(panel);

// 初始化显示
updateConfigDisplay();

console.log('网格配置示例');
console.log('- setGridSize(size): 设置网格大小');
console.log('- setGridColor(color): 设置网格颜色');
console.log('- setGridEnabled(enabled): 启用/禁用网格');
console.log('- getGridConfig(): 获取网格配置');`;

// 示例 4: 重置到中心
const EXAMPLE_4_CODE = `// 示例 4: 重置到中心 (resetToCenter)
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
  initialOffsetX: -100,
  initialOffsetY: -50,
});

// 创建一圈节点（用于演示中心位置）
const centerX = 0;
const centerY = 0;
const radius = 150;
const count = 8;

for (let i = 0; i < count; i++) {
  const angle = (i / count) * Math.PI * 2;
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;
  
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'];
  
  graph.addNode({
    id: \`node-\${i}\`,
    label: \`\${i + 1}\`,
    x: x,
    y: y,
    shape: Shape.Circle,
    style: {
      width: 60,
      height: 60,
      backgroundColor: colors[i],
      textColor: '#ffffff',
    },
  });
}

// 中心节点
graph.addNode({
  id: 'node-center',
  label: '中心',
  x: centerX,
  y: centerY,
  shape: Shape.Rect,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#1e293b',
    textColor: '#ffffff',
    borderRadius: 8,
  },
});

// 创建星形连接
for (let i = 0; i < count; i++) {
  graph.addEdge({
    id: \`edge-center-\${i}\`,
    source: { nodeId: 'node-center', portId: 'port-auto' },
    target: { nodeId: \`node-\${i}\`, portId: 'port-auto' },
    type: EdgeType.Straight,
    style: { stroke: '#94a3b8', strokeWidth: 1 },
  });
}

// 控制按钮
const controls = document.createElement('div');
controls.style.cssText = 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:12px;background:#1e293b;padding:12px 20px;borderRadius:8px;boxShadow:0 2px 12px rgba(0,0,0,0.2);';

const resetBtn = document.createElement('button');
resetBtn.textContent = '🔄 重置视图';
resetBtn.style.cssText = 'padding:8px 16px;background:#64748b;color:#fff;border:none;borderRadius:6px;cursor:pointer;fontSize:13px;fontWeight:500;';
resetBtn.onclick = () => {
  graph.reset();
  console.log('视图已重置到初始位置');
};

const centerBtn = document.createElement('button');
centerBtn.textContent = '🎯 重置到中心';
centerBtn.style.cssText = 'padding:8px 16px;background:#3b82f6;color:#fff;border:none;borderRadius:6px;cursor:pointer;fontSize:13px;fontWeight:500;';
centerBtn.onclick = () => {
  graph.resetToCenter();
  console.log('视图已重置到画布中心');
};

const randomBtn = document.createElement('button');
randomBtn.textContent = '🎲 随机位置';
randomBtn.style.cssText = 'padding:8px 16px;background:#f59e0b;color:#fff;border:none;borderRadius:6px;cursor:pointer;fontSize:13px;fontWeight:500;';
randomBtn.onclick = () => {
  const randomX = (Math.random() - 0.5) * 400;
  const randomY = (Math.random() - 0.5) * 300;
  graph.setOffset({ x: randomX, y: randomY });
  console.log(\`视图偏移到: \${randomX.toFixed(0)}, \${randomY.toFixed(0)}\`);
};

controls.appendChild(resetBtn);
controls.appendChild(centerBtn);
controls.appendChild(randomBtn);
container.appendChild(controls);

// 提示信息
const hint = document.createElement('div');
hint.style.cssText = 'position:absolute;top:12px;left:12px;background:rgba(30,41,59,0.9);color:#e2e8f0;padding:10px 16px;borderRadius:6px;fontSize:13px;maxWidth:280px;';
hint.innerHTML = '<b>💡 操作提示</b><br>先拖拽画布到任意位置，然后点击下方按钮测试 resetToCenter 方法';
container.appendChild(hint);

console.log('重置到中心示例');
console.log('- reset(): 重置到初始位置 (initialOffsetX, initialOffsetY)');
console.log('- resetToCenter(): 重置到画布中心点 (0, 0) 在画布中心');`;

// 示例 5: Port 和 Edge 的 zIndex 层级交互
const EXAMPLE_5_CODE = `// 示例 5: Port 和 Edge 的 zIndex 层级交互
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '节点 1',
  x: 150,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
    borderRadius: 8,
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '节点 2',
  x: 350,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
    borderRadius: 8,
  },
});

// 添加连接桩（设置较高的zIndex）
const port1 = node1.addPort({
  id: 'port-1-right',
  position: 'right',
  visible: true,
  style: {
    width: 16,
    height: 16,
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    strokeWidth: 2,
  },
});

const port2 = node2.addPort({
  id: 'port-2-left',
  position: 'left',
  visible: true,
  style: {
    width: 16,
    height: 16,
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    strokeWidth: 2,
  },
});

// 添加边（设置较低的zIndex）
const edge = graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-1', portId: 'port-1-right' },
  target: { nodeId: 'node-2', portId: 'port-2-left' },
  type: EdgeType.Straight,
  style: {
    stroke: '#ef4444',
    strokeWidth: 4,
    arrowSize: 12,
  },
});

// 控制面板
const panel = document.createElement('div');
panel.style.cssText = 'position:absolute;top:12px;right:12px;background:#1e293b;padding:16px;borderRadius:8px;boxShadow:0 2px 8px rgba(0,0,0,0.15);color:#e2e8f0;minWidth:220px;fontSize:13px;';

panel.innerHTML = \`
  <div style="font-weight:600;margin-bottom:12px;color:#fff;">🎯 zIndex 层级控制</div>
  <div style="margin-bottom:16px;padding:8px;background:#334155;borderRadius:4px;fontSize:12px;lineHeight:1.6;">
    <div style="color:#94a3b8;">层级规则：</div>
    <div>• zIndex 值越大，显示越在上层</div>
    <div>• Edge > Port → 边覆盖连接桩</div>
    <div>• Edge ≤ Port → 连接桩覆盖边</div>
  </div>
\`;

// Port zIndex 控制
const portControl = document.createElement('div');
portControl.style.cssText = 'margin-bottom:12px;';
portControl.innerHTML = '<div style="margin-bottom:6px;color:#f59e0b;">连接桩 zIndex</div>';

const portSlider = document.createElement('input');
portSlider.type = 'range';
portSlider.min = '0';
portSlider.max = '20';
portSlider.value = '0';
portSlider.style.cssText = 'width:100%;cursor:pointer;';

const portValue = document.createElement('span');
portValue.style.cssText = 'margin-left:8px;color:#f59e0b;fontFamily:monospace;';
portValue.textContent = '0';

portSlider.oninput = (e) => {
  const val = parseInt(e.target.value);
  port1.setZIndex(val);
  port2.setZIndex(val);
  portValue.textContent = val;
};

portControl.appendChild(portSlider);
portControl.appendChild(portValue);
panel.appendChild(portControl);

// Edge zIndex 控制
const edgeControl = document.createElement('div');
edgeControl.style.cssText = 'margin-bottom:12px;';
edgeControl.innerHTML = '<div style="margin-bottom:6px;color:#ef4444;">边线 zIndex</div>';

const edgeSlider = document.createElement('input');
edgeSlider.type = 'range';
edgeSlider.min = '0';
edgeSlider.max = '20';
edgeSlider.value = '0';
edgeSlider.style.cssText = 'width:100%;cursor:pointer;';

const edgeValue = document.createElement('span');
edgeValue.style.cssText = 'margin-left:8px;color:#ef4444;fontFamily:monospace;';
edgeValue.textContent = '0';

edgeSlider.oninput = (e) => {
  const val = parseInt(e.target.value);
  edge.setZIndex(val);
  edgeValue.textContent = val;
};

edgeControl.appendChild(edgeSlider);
edgeControl.appendChild(edgeValue);
panel.appendChild(edgeControl);

// 结果显示
const resultDisplay = document.createElement('div');
resultDisplay.style.cssText = 'margin-top:12px;padding:8px;background:#334155;borderRadius:4px;textAlign:center;fontSize:12px;';

function updateResult() {
  const portZ = parseInt(portSlider.value);
  const edgeZ = parseInt(edgeSlider.value);
  if (edgeZ > portZ) {
    resultDisplay.innerHTML = '<span style="color:#ef4444;">边线覆盖连接桩</span>';
  } else {
    resultDisplay.innerHTML = '<span style="color:#f59e0b;">连接桩覆盖边线</span>';
  }
}

portSlider.addEventListener('input', updateResult);
edgeSlider.addEventListener('input', updateResult);

panel.appendChild(resultDisplay);
container.appendChild(panel);

// 初始化显示
updateResult();

console.log('Port 和 Edge zIndex 层级交互示例');
console.log('- port.setZIndex(val): 设置连接桩层级');
console.log('- edge.setZIndex(val): 设置边线层级');`;

// 示例 6: 工作流图（ReactShape 自定义 HTML 节点）
const EXAMPLE_6_CODE = `// 示例 6: 工作流图 - 使用 ReactShape 自定义 HTML 节点
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#ffffff',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 安装 ReactShape 插件
const reactShapePlugin = new ReactShape();
graph.use(reactShapePlugin);

// 工作流节点组件 - 完全自定义 HTML
const WorkflowNode = ({ data, selected }) => {
  const { label, status = 'default', showStatusIcon = false } = data || {};
  
  // 状态颜色映射
  const statusColors = {
    success: '#22c55e',  // 绿色 - 已完成
    error: '#ef4444',    // 红色 - 失败
    running: '#3b82f6',  // 蓝色 - 运行中
    default: '#e5e7eb',  // 默认边框色
  };
  
  const borderColor = statusColors[status] || statusColors.default;
  
  // 状态图标
  const renderStatusIcon = () => {
    if (!showStatusIcon) return null;
    
    if (status === 'success') {
      // 绿色勾选
      return React.createElement('svg', {
        width: 16, height: 16, viewBox: '0 0 24 24',
        fill: 'none', stroke: '#22c55e', strokeWidth: 2.5
      }, React.createElement('polyline', { points: '20 6 9 17 4 12' }));
    }
    if (status === 'error') {
      // 红色叉号
      return React.createElement('svg', {
        width: 16, height: 16, viewBox: '0 0 24 24',
        fill: 'none', stroke: '#ef4444', strokeWidth: 2.5
      }, [
        React.createElement('path', { key: 'x1', d: 'M18 6L6 18' }),
        React.createElement('path', { key: 'x2', d: 'M6 6l12 12' })
      ]);
    }
    if (status === 'running') {
      // 蓝色旋转加载图标
      return React.createElement('svg', {
        width: 16, height: 16, viewBox: '0 0 24 24',
        fill: 'none', stroke: '#3b82f6', strokeWidth: 2.5,
        style: { animation: 'spin 1s linear infinite' }
      }, React.createElement('path', {
        d: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'
      }));
    }
    return null;
  };
  
  // 齿轮图标
  const GearIcon = React.createElement('svg', {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: '#9ca3af', strokeWidth: 1.5
  }, [
    React.createElement('circle', { key: 'c1', cx: 12, cy: 12, r: 3 }),
    React.createElement('path', { key: 'p1', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
  ]);
  
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      cursor: 'grab',
    }
  }, [
    // 左侧彩色边框条
    React.createElement('div', {
      key: 'border',
      style: {
        width: 4,
        height: '100%',
        background: borderColor,
        flexShrink: 0,
      }
    }),
    // 内容区
    React.createElement('div', {
      key: 'content',
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 8,
        height: '100%',
      }
    }, [
      // 齿轮图标
      React.createElement('span', { key: 'gear', style: { display: 'flex', alignItems: 'center' } }, GearIcon),
      // 标签文字
      React.createElement('span', {
        key: 'label',
        style: {
          flex: 1,
          fontSize: 14,
          color: '#374151',
          fontWeight: 500,
        }
      }, label || '节点'),
      // 状态图标
      showStatusIcon ? React.createElement('span', { key: 'status', style: { display: 'flex', alignItems: 'center' } }, renderStatusIcon()) : null,
    ])
  ]);
};

// 注册工作流节点形状 - 只配置实际使用的连接桩
reactShapePlugin.register({
  shape: 'workflow-node',
  width: 160,
  height: 48,
  component: WorkflowNode,
  ports: [
    { id: 'port-top', position: 'top' },
    { id: 'port-bottom', position: 'bottom' },
  ],
});

// 创建节点 - 按照图2布局
// 第一行：读数据
graph.addReactNode({
  shape: 'workflow-node',
  id: 'node-read',
  x: 300,
  y: 60,
  data: {
    label: '读数据',
    status: 'success',
    showStatusIcon: true,
  },
});

// 第二行：逻辑回归（运行中状态）
graph.addReactNode({
  shape: 'workflow-node',
  id: 'node-logic',
  x: 300,
  y: 180,
  data: {
    label: '逻辑回归',
    status: 'running',
    showStatusIcon: true,
  },
});

// 第三行左侧：模型预测
graph.addReactNode({
  shape: 'workflow-node',
  id: 'node-predict',
  x: 160,
  y: 320,
  data: {
    label: '模型预测',
    status: 'success',
    showStatusIcon: true,
  },
});

// 第三行右侧：读取参数（错误状态）
graph.addReactNode({
  shape: 'workflow-node',
  id: 'node-params',
  x: 440,
  y: 320,
  data: {
    label: '读取参数',
    status: 'error',
    showStatusIcon: true,
  },
});

// 添加连接线 - 使用贝塞尔曲线（平滑线）
// 读数据 → 逻辑回归（波浪动画线 - 表示数据正在流入）
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-read', portId: 'port-bottom' },
  target: { nodeId: 'node-logic', portId: 'port-top' },
  type: EdgeType.Bezier,
  style: {
    stroke: '#9ca3af',
    strokeWidth: 1,
    arrowSize: 0,
    dashed: true,
    dashPattern: [6, 4],
    // 波浪动画配置
    animated: true,
    waveColor: '#3b82f6',
    waveWidth: 2,
    waveLength: 15,
    waveSpeed: 2,
    waveOpacity: 0.8,
  },
});

// 启动边动画
graph.startEdgeAnimation();

// 逻辑回归 → 模型预测（平滑曲线，左侧）
graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'node-logic', portId: 'port-bottom' },
  target: { nodeId: 'node-predict', portId: 'port-top' },
  type: EdgeType.Bezier,
  style: {
    stroke: '#9ca3af',
    strokeWidth: 1,
    arrowSize: 0,
  },
});

// 逻辑回归 → 读取参数（平滑曲线，右侧）
graph.addEdge({
  id: 'edge-3',
  source: { nodeId: 'node-logic', portId: 'port-bottom' },
  target: { nodeId: 'node-params', portId: 'port-top' },
  type: EdgeType.Bezier,
  style: {
    stroke: '#9ca3af',
    strokeWidth: 1,
    arrowSize: 0,
  },
});

// 添加旋转动画样式
const style = document.createElement('style');
style.textContent = \`
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
\`;
document.head.appendChild(style);

// 标题
const title = document.createElement('div');
title.style.cssText = 'position:absolute;top:12px;left:16px;font-size:14px;font-weight:600;color:#374151;';
title.textContent = '机器学习工作流';
container.appendChild(title);

console.log('工作流图示例已加载（ReactShape 自定义节点 - 运行中状态带波浪线）');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础 Graph', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '缩放控制', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '网格配置', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '重置到中心', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: 'zIndex 层级', code: EXAMPLE_5_CODE },
  { id: 'example-6', title: '工作流图', code: EXAMPLE_6_CODE },
];

/**
 * GraphExample - 交互式图表示例
 */
export const GraphExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  // 执行用户代码并渲染 Graph
  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph, Shape, EdgeType } = await import('../core');
      const { ReactShape } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
        EdgeType,
        ReactShape,
        React,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, EdgeType, ReactShape, React } = sandbox;
        ${codeToExecute}
      `;

      const fn = new Function('sandbox', executableCode);
      fn(sandbox);
    } catch (error) {
      console.error('代码执行错误:', error);
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    codeRef.current = newCode;
  }, []);

  const handleRunCode = useCallback(() => {
    executeCode(codeRef.current);
  }, [executeCode]);

  const handleResetCode = useCallback(() => {
    const code = EXAMPLES[currentExample].code;
    codeRef.current = code;
    setEditorKey((prev) => prev + 1);
    executeCode(code);
  }, [currentExample, executeCode]);

  const switchExample = useCallback(
    (index: number) => {
      setCurrentExample(index);
      const code = EXAMPLES[index].code;
      codeRef.current = code;
      setEditorKey((prev) => prev + 1);
      executeCode(code);
    },
    [executeCode]
  );

  useEffect(() => {
    executeCode(EXAMPLE_1_CODE);
  }, [executeCode]);

  // 左侧面板 - 图例展示
  const LeftPanel = (
    <Panel>
      <PanelHeader icon="📊" title="图例预览" hint="编辑代码后点击运行" />
      <div
        ref={graphContainerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      />
    </Panel>
  );

  // 右侧面板 - 代码编辑
  const RightPanel = (
    <Panel>
      <PanelHeader icon="💻" title="代码编辑" />
      <PanelContent>
        <CodeEditor
          key={editorKey}
          value={EXAMPLES[currentExample].code}
          onUpdate={handleCodeChange}
          language="tsx"
        />
      </PanelContent>
      <PanelToolbar>
        <Button onClick={handleResetCode}>重置</Button>
        <Button type="primary" onClick={handleRunCode}>
          ▶ 运行代码
        </Button>
      </PanelToolbar>
    </Panel>
  );

  // 底部面板 - API 文档
  const BottomPanel = (
    <Panel>
      <PanelHeader icon="📋" title="API 文档" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div id="graph-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            GraphOptions - 画布配置选项
          </h3>
          <Table columns={graphOptionsColumns} dataSource={graphOptionsData} pagination={false} />
        </div>
        <div id="graph-methods-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Graph 类方法
          </h3>
          <Table columns={graphMethodsColumns} dataSource={graphMethodsData} pagination={false} />
        </div>
        <div id="graph-events-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Graph 事件
          </h3>
          <Table columns={graphEventColumns} dataSource={graphEventData} pagination={false} />
        </div>
        <div id="react-shape-methods-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ReactShape 插件 - 注册方法
          </h3>
          <Table columns={reactShapeMethodsColumns} dataSource={reactShapeMethodsData} pagination={false} />
        </div>
        <div id="react-shape-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ReactShapeConfig - 配置选项
          </h3>
          <Table columns={reactShapeConfigColumns} dataSource={reactShapeConfigData} pagination={false} />
        </div>
        <div id="react-node-props-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ReactNodeProps - 组件接收属性
          </h3>
          <Table columns={reactNodePropsColumns} dataSource={reactNodePropsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="graph-example-title" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <PanelHeader title="图编辑器示例" />
        {/* 示例切换按钮 */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 16px',
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {EXAMPLES.map((ex, index) => (
            <div key={ex.id} id={ex.id}>
              <button
                onClick={() => switchExample(index)}
                style={{
                  padding: '6px 16px',
                  background: currentExample === index ? '#3b82f6' : '#ffffff',
                  color: currentExample === index ? '#ffffff' : '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                示例 {index + 1}: {ex.title}
              </button>
            </div>
          ))}
        </div>
        <Splitter style={{ flex: 1, minHeight: 0 }}>
          {LeftPanel}
          {RightPanel}
        </Splitter>
      </div>
      {BottomPanel}
      {/* 浮动锚点 */}
      <div
        style={{
          position: 'fixed',
          right: '16px',
          top: '20%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Anchor affix={false} getContainer={() => document.body}>
          <Anchor.Link href="#graph-example-title" title="图编辑器示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#graph-options-section" title="GraphOptions" />
          <Anchor.Link href="#graph-methods-section" title="Graph 类方法" />
          <Anchor.Link href="#graph-events-section" title="Graph 事件" />
          <Anchor.Link href="#react-shape-methods-section" title="ReactShape 方法" />
          <Anchor.Link href="#react-shape-config-section" title="ReactShapeConfig" />
          <Anchor.Link href="#react-node-props-section" title="ReactNodeProps" />
        </Anchor>
      </div>
    </div>
  );
};

export default GraphExample;
