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

// PortOptions 表格数据
const portOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 220 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const portOptionsData = [
  { name: 'id', type: 'string', required: '是', default: '-', description: '端口唯一标识符' },
  { name: 'position', type: 'PortPosition | Point', required: '是', default: '-', description: '端口位置（方位字符串或相对坐标）' },
  { name: 'label', type: 'string', required: '否', default: "''", description: '端口显示文本' },
  { name: 'visible', type: 'boolean', required: '否', default: 'true', description: '是否可见' },
  { name: 'style', type: 'PortStyle', required: '否', default: '{}', description: '端口样式配置' },
  { name: 'data', type: 'Record<string, any>', required: '否', default: '{}', description: '自定义业务数据' },
];

// Port 类方法表格数据
const portMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 220 },
  { title: '参数', dataIndex: 'params', width: 280 },
  { title: '返回值', dataIndex: 'return', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const portMethodsData = [
  { key: '1', name: 'getId()', params: '-', return: 'string', description: '获取端口唯一 ID' },
  { key: '2', name: 'getPosition() / setPosition(position)', params: 'position: PortPosition | Point', return: 'PortPosition / void', description: '获取/设置端口位置' },
  { key: '3', name: 'getLabel() / setLabel(label)', params: 'label: string', return: 'string / void', description: '获取/设置端口标签' },
  { key: '4', name: 'getStyle() / setStyle(style)', params: 'style: Partial<PortStyle>', return: 'PortStyle / void', description: '获取/设置端口样式' },
  { key: '5', name: 'getVisible() / setVisible(visible)', params: 'visible: boolean', return: 'boolean / void', description: '获取/设置可见性' },
  { key: '6', name: 'getConnectionPoint()', params: '-', return: 'Point', description: '获取端口的实际连接点坐标' },
  { key: '7', name: 'getNode()', params: '-', return: 'Node | null', description: '获取端口所属的节点' },
  { key: '8', name: 'isConnected()', params: '-', return: 'boolean', description: '检查端口是否已连接边' },
  { key: '9', name: 'getEdges()', params: '-', return: 'Edge[]', description: '获取连接到此端口的所有边' },
  { key: '10', name: 'on(event, handler)', params: 'event: string, handler: Function', return: 'void', description: '监听端口事件（click, dblclick等）' },
  { key: '11', name: 'toJSON()', params: '-', return: 'object', description: '序列化为 JSON' },
];

// PortPosition 类型
const portPositionColumns = [
  { title: '位置值', dataIndex: 'value', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const portPositionData = [
  { value: "'top'", description: '节点顶部中央' },
  { value: "'right'", description: '节点右侧中央' },
  { value: "'bottom'", description: '节点底部中央' },
  { value: "'left'", description: '节点左侧中央' },
  { value: "'center'", description: '节点中心' },
  { value: '{ x: number, y: number }', description: '相对坐标 (0-1)，自定义位置' },
];

// 示例 1: 基础方位端口
const EXAMPLE_1_CODE = `// 示例 1: 基础方位端口
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建节点
const node = graph.addNode({
  id: 'node-basic',
  label: '基础端口节点',
  x: 300,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 160,
    height: 100,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

// 添加四个基本方位的端口
node.addPort({
  id: 'port-top',
  position: 'top',
  visible: true,
  style: { fillColor: '#22c55e', strokeColor: '#16a34a', width: 12, height: 12, strokeWidth: 2 },
});

node.addPort({
  id: 'port-right',
  position: 'right',
  visible: true,
  style: { fillColor: '#f59e0b', strokeColor: '#d97706', width: 12, height: 12, strokeWidth: 2 },
});

node.addPort({
  id: 'port-bottom',
  position: 'bottom',
  visible: true,
  style: { fillColor: '#ef4444', strokeColor: '#dc2626', width: 12, height: 12, strokeWidth: 2 },
});

node.addPort({
  id: 'port-left',
  position: 'left',
  visible: true,
  style: { fillColor: '#8b5cf6', strokeColor: '#7c3aed', width: 12, height: 12, strokeWidth: 2 },
});

// 创建目标节点
const targetNode = graph.addNode({
  id: 'node-target',
  label: '目标',
  x: 480,
  y: 150,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});
targetNode.addPort({ id: 'port-in', position: 'left', visible: true });

// 连接端口
graph.addEdge({
  id: 'edge-demo',
  source: { nodeId: 'node-basic', portId: 'port-right' },
  target: { nodeId: 'node-target', portId: 'port-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

console.log('端口位置: top, right, bottom, left');
console.log('每个端口都有不同的颜色');`;

// 示例 2: 多端口布局
const EXAMPLE_2_CODE = `// 示例 2: 多端口布局（批量添加）
const graph = new Graph({
  container: container,
  width: 600,
  height: 350,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建多端口节点
const multiPortNode = graph.addNode({
  id: 'node-multi',
  label: '多端口布局',
  x: 150,
  y: 175,
  shape: Shape.Rect,
  style: {
    width: 140,
    height: 120,
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
    textColor: '#ffffff',
  },
});

// 使用 addPortGroup 批量添加顶部端口（自动均匀分布）
multiPortNode.addPortGroup({
  id: 'top-ports',
  position: 'top',
  count: 3,
  portConfig: (index) => ({
    id: \`port-top-\${index}\`,
    label: \`T\${index + 1}\`,
    visible: true,
    style: { fillColor: '#22c55e', strokeColor: '#16a34a', width: 12, height: 12, strokeWidth: 2 },
  }),
});

// 批量添加底部端口
multiPortNode.addPortGroup({
  id: 'bottom-ports',
  position: 'bottom',
  count: 3,
  portConfig: (index) => ({
    id: \`port-bottom-\${index}\`,
    label: \`B\${index + 1}\`,
    visible: true,
    style: { fillColor: '#ef4444', strokeColor: '#dc2626', width: 12, height: 12, strokeWidth: 2 },
  }),
});

// 左侧和右侧各添加一个
multiPortNode.addPort({ id: 'port-left', position: 'left', visible: true });
multiPortNode.addPort({ id: 'port-right', position: 'right', visible: true });

// 创建目标节点
const targetNode = graph.addNode({
  id: 'node-output',
  label: '输出节点',
  x: 450,
  y: 175,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
});

// 为目标节点添加端口组
targetNode.addPortGroup({
  id: 'input-ports',
  position: 'left',
  count: 3,
  portConfig: (index) => ({
    id: \`port-in-\${index}\`,
    label: \`In\${index + 1}\`,
    visible: true,
    style: { fillColor: '#ffffff', strokeColor: '#7c3aed', width: 10, height: 10, strokeWidth: 2 },
  }),
});

// 创建连接
for (let i = 0; i < 3; i++) {
  graph.addEdge({
    id: \`edge-\${i}\`,
    source: { nodeId: 'node-multi', portId: \`port-bottom-\${i}\` },
    target: { nodeId: 'node-output', portId: \`port-in-\${i}\` },
    type: EdgeType.Horizontal,
    style: { stroke: '#64748b', strokeWidth: 1.5 },
  });
}

console.log('addPortGroup 自动均匀分布端口位置');`;

// 示例 3: 自定义位置端口
const EXAMPLE_3_CODE = `// 示例 3: 自定义位置端口
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建自定义端口节点
const customNode = graph.addNode({
  id: 'node-custom',
  label: '自定义位置',
  x: 300,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 160,
    height: 100,
    backgroundColor: '#ec4899',
    borderColor: '#db2777',
    textColor: '#ffffff',
  },
});

// 使用相对坐标添加端口（x, y 范围 0-1）
// 左上角
customNode.addPort({
  id: 'port-tl',
  position: { x: 0.25, y: 0 },
  visible: true,
  style: { fillColor: '#f59e0b', strokeColor: '#d97706', width: 12, height: 12, strokeWidth: 2 },
});

// 右上角
customNode.addPort({
  id: 'port-tr',
  position: { x: 0.75, y: 0 },
  visible: true,
  style: { fillColor: '#f59e0b', strokeColor: '#d97706', width: 12, height: 12, strokeWidth: 2 },
});

// 左下角
customNode.addPort({
  id: 'port-bl',
  position: { x: 0.25, y: 1 },
  visible: true,
  style: { fillColor: '#3b82f6', strokeColor: '#2563eb', width: 12, height: 12, strokeWidth: 2 },
});

// 右下角
customNode.addPort({
  id: 'port-br',
  position: { x: 0.75, y: 1 },
  visible: true,
  style: { fillColor: '#3b82f6', strokeColor: '#2563eb', width: 12, height: 12, strokeWidth: 2 },
});

// 中心端口（用于菱形节点）
const diamondNode = graph.addNode({
  id: 'node-diamond',
  label: '菱形节点',
  x: 500,
  y: 150,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: 0, y: -40 },
      { x: 50, y: 0 },
      { x: 0, y: 40 },
      { x: -50, y: 0 },
    ],
  },
  style: {
    width: 100,
    height: 80,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});

// 在菱形中心添加端口
diamondNode.addPort({
  id: 'port-center',
  position: 'center',
  visible: true,
  style: { fillColor: '#ffffff', strokeColor: '#d97706', width: 16, height: 16, strokeWidth: 2 },
});

// 连接
diamondNode.addPort({ id: 'port-left', position: 'left', visible: true });
graph.addEdge({
  id: 'edge-custom',
  source: { nodeId: 'node-custom', portId: 'port-tr' },
  target: { nodeId: 'node-diamond', portId: 'port-left' },
  type: EdgeType.Bezier,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

console.log('使用 { x, y } 相对坐标自定义端口位置');
console.log('x: 0-1 (从左到右), y: 0-1 (从上到下)');`;

// 示例 4: 端口样式
const EXAMPLE_4_CODE = `// 示例 4: 端口样式配置
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 小端口
const smallNode = graph.addNode({
  id: 'node-small',
  label: '小端口',
  x: 100,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});
smallNode.addPort({
  id: 'port-small',
  position: 'right',
  visible: true,
  style: { width: 8, height: 8, fillColor: '#ffffff', strokeColor: '#d97706', strokeWidth: 2 },
});

// 中等端口
const mediumNode = graph.addNode({
  id: 'node-medium',
  label: '中端口',
  x: 250,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});
mediumNode.addPort({
  id: 'port-medium',
  position: 'right',
  visible: true,
  style: { width: 12, height: 12, fillColor: '#ffffff', strokeColor: '#16a34a', strokeWidth: 2 },
});

// 大端口
const largeNode = graph.addNode({
  id: 'node-large',
  label: '大端口',
  x: 400,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});
largeNode.addPort({
  id: 'port-large',
  position: 'right',
  visible: true,
  style: { width: 20, height: 20, fillColor: '#ffffff', strokeColor: '#2563eb', strokeWidth: 2 },
});

// 带标签的端口
const labeledNode = graph.addNode({
  id: 'node-labeled',
  label: '带标签端口',
  x: 200,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 140,
    height: 80,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
});
labeledNode.addPort({
  id: 'port-in',
  position: 'left',
  label: '输入',
  visible: true,
  style: { width: 14, height: 14, fillColor: '#22c55e', strokeColor: '#16a34a', strokeWidth: 2 },
});
labeledNode.addPort({
  id: 'port-out',
  position: 'right',
  label: '输出',
  visible: true,
  style: { width: 14, height: 14, fillColor: '#ef4444', strokeColor: '#dc2626', strokeWidth: 2 },
});

console.log('端口样式属性:');
console.log('- width, height: 端口大小');
console.log('- fillColor: 填充颜色');
console.log('- strokeColor: 边框颜色');
console.log('- strokeWidth: 边框宽度');`;

// 示例 5: 端口可见性
const EXAMPLE_5_CODE = `// 示例 5: 端口可见性控制
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建可切换端口可见性的节点
const toggleNode = graph.addNode({
  id: 'node-toggle',
  label: '可切换端口',
  x: 300,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 160,
    height: 100,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
});

// 添加端口（部分初始隐藏）
const ports = [
  { id: 'port-top', pos: 'top', visible: true, color: '#22c55e' },
  { id: 'port-right', pos: 'right', visible: false, color: '#f59e0b' },
  { id: 'port-bottom', pos: 'bottom', visible: true, color: '#ef4444' },
  { id: 'port-left', pos: 'left', visible: false, color: '#3b82f6' },
];

ports.forEach((p) => {
  toggleNode.addPort({
    id: p.id,
    position: p.pos,
    visible: p.visible,
    style: { fillColor: p.color, strokeColor: p.color, width: 12, height: 12, strokeWidth: 2 },
  });
});

// 创建控制节点
const controlNode = graph.addNode({
  id: 'node-control',
  label: '控制器',
  x: 100,
  y: 150,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
    textColor: '#ffffff',
  },
});

// 连接可见端口
controlNode.addPort({ id: 'port-out', position: 'right', visible: true });
toggleNode.addPort({ id: 'port-in', position: 'left', visible: true });

graph.addEdge({
  id: 'edge-control',
  source: { nodeId: 'node-control', portId: 'port-out' },
  target: { nodeId: 'node-toggle', portId: 'port-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

// 演示切换可见性
console.log('当前端口状态:');
ports.forEach((p) => {
  const port = toggleNode.getPort(p.id);
  console.log(\`  \${p.id}: \${port?.getVisible() ? '可见' : '隐藏'}\`);
});

console.log('\\n可以使用 port.setVisible(true/false) 切换可见性');`;

// 示例 6: Port 事件
const EXAMPLE_6_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 280,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建日志显示区域
const logContainer = document.createElement('div');
logContainer.style.cssText = 'position:absolute;bottom:8px;left:8px;right:8px;height:100px;background:#1e293b;color:#e2e8f0;padding:8px;borderRadius:6px;overflow:auto;fontSize:12px;fontFamily:monospace;';
container.appendChild(logContainer);

const addLog = (msg) => {
  const line = document.createElement('div');
  line.textContent = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
};

// 创建两个节点
const sourceNode = graph.addNode({
  id: 'node-source',
  label: '源节点',
  x: 120,
  y: 120,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

const targetNode = graph.addNode({
  id: 'node-target',
  label: '目标节点',
  x: 400,
  y: 120,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

// 添加连接桩
sourceNode.addPort({ id: 'port-out', position: 'right', visible: true });
targetNode.addPort({ id: 'port-in', position: 'left', visible: true });
targetNode.addPort({ id: 'port-top', position: 'top', visible: true });
targetNode.addPort({ id: 'port-bottom', position: 'bottom', visible: true });

// 创建边
graph.addEdge({
  id: 'edge-demo',
  source: { nodeId: 'node-source', portId: 'port-out' },
  target: { nodeId: 'node-target', portId: 'port-in' },
  label: '连接边',
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

// ========== Port 事件监听 ==========

// 鼠标进入事件
graph.on(EVENT_NAMES.PORT_MOUSEENTER, (e) => {
  addLog(\`🖱️ 鼠标进入连接桩: \${e.portId} (节点: \${e.nodeId})\`);
  // 高亮效果
  e.port.updateStyle({ fillColor: '#fbbf24', strokeColor: '#f59e0b', strokeWidth: 3 });
  graph.scheduleRender();
});

// 鼠标离开事件
graph.on(EVENT_NAMES.PORT_MOUSELEAVE, (e) => {
  addLog(\`🖱️ 鼠标离开连接桩: \${e.portId}\`);
  // 恢复默认样式
  e.port.updateStyle({ fillColor: '#ffffff', strokeColor: '#64748b', strokeWidth: 2 });
  graph.scheduleRender();
});

// 鼠标按下事件
graph.on(EVENT_NAMES.PORT_MOUSEDOWN, (e) => {
  addLog(\`🔽 鼠标按下连接桩: \${e.portId}\`);
});

// 鼠标释放事件
graph.on(EVENT_NAMES.PORT_MOUSEUP, (e) => {
  addLog(\`🔼 鼠标释放连接桩: \${e.portId}\`);
});

// 点击事件
graph.on(EVENT_NAMES.PORT_CLICK, (e) => {
  addLog(\`👆 点击连接桩: \${e.portId}\`);
  addLog(\`   所属节点: \${e.nodeId}, 位置: \${e.port.getPosition()}\`);
});

// 双击事件
graph.on(EVENT_NAMES.PORT_DBLCLICK, (e) => {
  addLog(\`👆👆 双击连接桩: \${e.portId}\`);
});

// 右键菜单事件
graph.on(EVENT_NAMES.PORT_CONTEXTMENU, (e) => {
  addLog(\`📋 右键菜单连接桩: \${e.portId}\`);
  // 阻止默认右键菜单
  e.preventDefault?.();
});

addLog('连接桩事件监听已启动，请与连接桩交互...');`;

// 示例 7: 拖拽连接（新功能）
const EXAMPLE_7_CODE = `// 示例 7: 拖拽连接创建边
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建源节点（左侧）
const sourceNode = graph.addNode({
  id: 'node-source',
  label: '源节点',
  x: 120,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 为源节点添加输出连接桩（右侧）
sourceNode.addPort({
  id: 'port-out',
  position: 'right',
  visible: true,
  style: {
    width: 14,
    height: 14,
    fillColor: '#ffffff',
    strokeColor: '#16a34a',
    strokeWidth: 2,
    hoverFillColor: '#dcfce7',
    hoverStrokeColor: '#22c55e',
  },
});

// 创建目标节点（右侧）
const targetNode = graph.addNode({
  id: 'node-target',
  label: '目标节点',
  x: 480,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

// 为目标节点添加入连接桩（左侧）
targetNode.addPort({
  id: 'port-in',
  position: 'left',
  visible: true,
  style: {
    width: 14,
    height: 14,
    fillColor: '#ffffff',
    strokeColor: '#2563eb',
    strokeWidth: 2,
    hoverFillColor: '#dbeafe',
    hoverStrokeColor: '#3b82f6',
  },
});

// 为目标节点添加底部连接桩
targetNode.addPort({
  id: 'port-bottom',
  position: 'bottom',
  visible: true,
  style: {
    width: 14,
    height: 14,
    fillColor: '#ffffff',
    strokeColor: '#2563eb',
    strokeWidth: 2,
    hoverFillColor: '#dbeafe',
    hoverStrokeColor: '#3b82f6',
  },
});

// 创建另一个节点
const bottomNode = graph.addNode({
  id: 'node-bottom',
  label: '底部节点',
  x: 480,
  y: 220,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});

bottomNode.addPort({
  id: 'port-top',
  position: 'top',
  visible: true,
  style: {
    width: 14,
    height: 14,
    fillColor: '#ffffff',
    strokeColor: '#d97706',
    strokeWidth: 2,
    hoverFillColor: '#fef3c7',
    hoverStrokeColor: '#f59e0b',
  },
});

// 添加操作提示
const hint = document.createElement('div');
hint.style.cssText = 'position:absolute;top:8px;left:8px;background:#1e293b;color:#e2e8f0;padding:8px 12px;borderRadius:6px;fontSize:13px;';
hint.innerHTML = '💡 <b>操作提示：</b>从源节点的连接桩拖拽到目标节点的连接桩创建连线';
container.appendChild(hint);

// 监听边创建事件
graph.on('edge:added', (e) => {
  console.log('新边已创建:', e.edge.getId());
});`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础方位端口', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '多端口布局', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '自定义位置', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '端口样式', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '可见性控制', code: EXAMPLE_5_CODE },
  { id: 'example-6', title: 'Port 事件', code: EXAMPLE_6_CODE },
  { id: 'example-7', title: '拖拽连接', code: EXAMPLE_7_CODE },
];

/**
 * PortExample - Port 连接桩组件使用示例
 */
export const PortExample: React.FC = () => {
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
      const { Graph, Shape, EdgeType, EVENT_NAMES } = await import('../core');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
        EdgeType,
        EVENT_NAMES,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, EdgeType, EVENT_NAMES } = sandbox;
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
        <div id="port-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            PortOptions - 端口配置选项
          </h3>
          <Table columns={portOptionsColumns} dataSource={portOptionsData} pagination={false} />
        </div>
        <div id="port-position-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            PortPosition - 端口位置类型
          </h3>
          <Table columns={portPositionColumns} dataSource={portPositionData} pagination={false} />
        </div>
        <div id="port-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Port 类方法</h3>
          <Table columns={portMethodsColumns} dataSource={portMethodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="port-example-title" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <PanelHeader title="Port 连接桩示例" />
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
            <button
              key={ex.id}
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
          <Anchor.Link href="#port-example-title" title="Port 连接桩示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#port-options-section" title="PortOptions" />
          <Anchor.Link href="#port-position-section" title="PortPosition" />
          <Anchor.Link href="#port-methods-section" title="Port 类方法" />
        </Anchor>
      </div>
    </div>
  );
};

export default PortExample;
