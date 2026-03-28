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

// EdgeOptions 表格数据
const edgeOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const edgeOptionsData = [
  { name: 'id', type: 'string', required: '是', default: '-', description: '边唯一标识符' },
  { name: 'source', type: 'ConnectionPoint', required: '是', default: '-', description: '源节点/端口连接点 { nodeId, portId? }' },
  { name: 'target', type: 'ConnectionPoint', required: '是', default: '-', description: '目标节点/端口连接点 { nodeId, portId? }' },
  { name: 'label', type: 'string', required: '否', default: "''", description: '边的显示文本' },
  { name: 'type', type: 'EdgeType', required: '否', default: 'EdgeType.Straight', description: '边类型（直线/折线/曲线/弧线）' },
  { name: 'style', type: 'EdgeStyle', required: '否', default: '{}', description: '边的样式配置' },
  { name: 'data', type: 'Record<string, any>', required: '否', default: '{}', description: '自定义业务数据' },
  { name: 'visible', type: 'boolean', required: '否', default: 'true', description: '是否可见' },
  { name: 'zIndex', type: 'number', required: '否', default: '0', description: '层级索引，数值越高显示越在上层' },
];

// EdgeStyle 流动波浪配置
const edgeStyleColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 150 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const edgeStyleData = [
  { name: 'stroke', type: 'string', default: "'#94a3b8'", description: '线条颜色' },
  { name: 'strokeWidth', type: 'number', default: '2', description: '线条宽度' },
  { name: 'dashed', type: 'boolean', default: 'false', description: '是否为虚线' },
  { name: 'dashPattern', type: '[number, number]', default: '[5, 5]', description: '虚线模式 [实线长度, 间隔长度]' },
  { name: 'arrowSize', type: 'number', default: '10', description: '箭头大小（0 表示无箭头）' },
  { name: 'arrowColor', type: 'string', default: "'#94a3b8'", description: '箭头颜色' },
  { name: 'cornerRadius', type: 'number', default: '10', description: '圆角半径（用于折线）' },
  { name: 'animated', type: 'boolean', default: 'false', description: '是否启用流动波浪效果' },
  { name: 'waveColor', type: 'string', default: "'#3b82f6'", description: '波浪颜色' },
  { name: 'waveWidth', type: 'number', default: '2', description: '波浪线条宽度' },
  { name: 'waveLength', type: 'number', default: '15', description: '单个波浪长度（像素）' },
  { name: 'waveSpeed', type: 'number', default: '1.5', description: '波浪流动速度（像素/帧）' },
  { name: 'waveOpacity', type: 'number', default: '0.6', description: '波浪透明度（0-1）' },
  { name: 'jumpHeight', type: 'number', default: '8', description: '跳线高度（用于跳线类型的边）' },
  { name: 'jumpWidth', type: 'number', default: '12', description: '跳线宽度（用于跳线类型的边）' },
];

// Edge 事件表格数据
const edgeEventColumns = [
  { title: '事件名称', dataIndex: 'name', width: 220 },
  { title: '触发时机', dataIndex: 'trigger', width: 200 },
  { title: '事件参数', dataIndex: 'params', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const edgeEventData = [
  { name: 'edge:click', trigger: '点击边', params: '{ edge, originalEvent }', description: '鼠标左键点击边时触发' },
  { name: 'edge:dblclick', trigger: '双击边', params: '{ edge, originalEvent }', description: '鼠标双击边时触发' },
  { name: 'edge:mousedown', trigger: '鼠标按下', params: '{ edge, originalEvent }', description: '在边上按下鼠标按钮时触发' },
  { name: 'edge:mouseup', trigger: '鼠标释放', params: '{ edge, originalEvent }', description: '在边上释放鼠标按钮时触发' },
  { name: 'edge:mouseenter', trigger: '鼠标进入', params: '{ edge, originalEvent }', description: '鼠标移入边区域时触发' },
  { name: 'edge:mouseleave', trigger: '鼠标离开', params: '{ edge, originalEvent }', description: '鼠标移出边区域时触发' },
  { name: 'edge:selected', trigger: '边被选中', params: '{ edge }', description: '边被选中时触发' },
  { name: 'edge:unselected', trigger: '取消选中', params: '{ edge }', description: '边取消选中时触发' },
  { name: 'edge:added', trigger: '添加边', params: '{ edge }', description: '新边添加到画布时触发' },
  { name: 'edge:removed', trigger: '移除边', params: '{ edge }', description: '边从画布移除时触发' },
  { name: 'edge:disconnect', trigger: '断开连接', params: '{ edge }', description: '边断开连接时触发' },
  { name: 'edge:reconnect', trigger: '重新连接', params: '{ edge }', description: '边重新连接时触发' },
  { name: 'edge:connection:start', trigger: '开始连接', params: '{ sourcePort, originalEvent }', description: '从连接桩开始拖拽连线时触发' },
  { name: 'edge:connection:complete', trigger: '完成连接', params: '{ edge, sourcePort, targetPort }', description: '连线完成并创建边时触发' },
  { name: 'edge:connection:fail', trigger: '连接失败', params: '{ sourcePort, targetPort, reason }', description: '连线失败时触发（如验证不通过）' },
];

// Edge 类方法表格数据
const edgeMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 220 },
  { title: '参数', dataIndex: 'params', width: 280 },
  { title: '返回值', dataIndex: 'return', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const edgeMethodsData = [
  { key: '1', name: 'getId()', params: '-', return: 'string', description: '获取边唯一 ID' },
  { key: '2', name: 'getSourceId()', params: '-', return: 'string', description: '获取源节点 ID' },
  { key: '3', name: 'getTargetId()', params: '-', return: 'string', description: '获取目标节点 ID' },
  { key: '4', name: 'getSource() / getSourceAnchor()', params: '-', return: 'EdgeAnchor', description: '获取源连接点配置' },
  { key: '5', name: 'getTarget() / getTargetAnchor()', params: '-', return: 'EdgeAnchor', description: '获取目标连接点配置' },
  { key: '6', name: 'getLabel() / setLabel(label)', params: 'label: string', return: 'string / void', description: '获取/设置边标签' },
  { key: '7', name: 'getType() / setType(type)', params: 'type: EdgeType', return: 'EdgeType / void', description: '获取/设置边类型' },
  { key: '8', name: 'getStyle() / setStyle(style)', params: 'style: Partial<EdgeStyle>', return: 'EdgeStyle / void', description: '获取/设置边样式' },
  { key: '9', name: 'updateStyle(style)', params: 'style: Partial<EdgeStyle>', return: 'void', description: '更新边样式（合并现有样式）' },
  { key: '10', name: 'getZIndex() / setZIndex(zIndex)', params: 'zIndex: number', return: 'number / void', description: '获取/设置层级索引，数值越高显示越在上层' },
  { key: '11', name: 'containsPoint(point, tolerance?)', params: 'point: { x, y }, tolerance?: number', return: 'boolean', description: '检测点是否在边上（可设置容差）' },
  { key: '12', name: 'startAnimation(waveOptions?)', params: 'waveOptions?: WaveOptions', return: 'boolean', description: '启动流动波浪动画，可传入波浪配置' },
  { key: '13', name: 'stopAnimation()', params: '-', return: 'boolean', description: '停止流动波浪动画' },
  { key: '14', name: 'isAnimationPlaying()', params: '-', return: 'boolean', description: '检查是否正在播放流动动画' },
  { key: '15', name: 'disconnect()', params: '-', return: 'boolean', description: '断开边连接（隐藏但不删除）' },
  { key: '16', name: 'reconnect()', params: '-', return: 'boolean', description: '重新连接边' },
  { key: '17', name: 'isConnected()', params: '-', return: 'boolean', description: '检查边是否已连接' },
  { key: '18', name: 'getOffset()', params: '-', return: '{ x: number, y: number }', description: '获取边的当前偏移量' },
  { key: '19', name: 'setOffset(x, y)', params: 'x: number, y: number', return: 'void', description: '设置边的偏移量（移动边位置）' },
  { key: '20', name: 'updateOffset(deltaX, deltaY)', params: 'deltaX: number, deltaY: number', return: 'void', description: '相对当前偏移量更新边位置' },
  { key: '21', name: 'resetOffset()', params: '-', return: 'void', description: '重置边的偏移量为零' },
  { key: '22', name: 'toJSON()', params: '-', return: 'EdgeData', description: '序列化为 JSON（包含偏移量）' },
  { key: '23', name: 'clone(newId?)', params: 'newId?: string', return: 'Edge', description: '克隆边（包含偏移量）' },
];

// EdgeType 枚举
const edgeTypeColumns = [
  { title: '枚举值', dataIndex: 'name', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const edgeTypeData = [
  { name: 'EdgeType.Straight', description: '直线 - 两点之间的直接连线' },
  { name: 'EdgeType.Horizontal', description: '水平折线 - 先水平后垂直的折线，适合水平布局' },
  { name: 'EdgeType.Vertical', description: '垂直折线 - 先垂直后水平的折线，适合垂直布局' },
  { name: 'EdgeType.Bezier', description: '贝塞尔曲线 - 平滑的曲线连接' },
  { name: 'EdgeType.Arc', description: '弧线 - 圆弧连接' },
  { name: 'EdgeType.StepRight', description: '阶梯折线(先水平后垂直) - 直角阶梯，适合树形结构' },
  { name: 'EdgeType.StepDown', description: '阶梯折线(先垂直后水平) - 直角阶梯，适合垂直流程' },
  { name: 'EdgeType.RoundedStepRight', description: '圆角阶梯(先水平后垂直) - 带圆角的阶梯折线' },
  { name: 'EdgeType.RoundedStepDown', description: '圆角阶梯(先垂直后水平) - 带圆角的阶梯折线' },
  { name: 'EdgeType.SmoothStep', description: '平滑 L 型 - 正交圆角折线，适合流程图' },
  { name: 'EdgeType.Orthogonal', description: '正交折线 - 智能路由，自动选择最优路径' },
  { name: 'EdgeType.DashedStep', description: '虚线阶梯 - 虚线直角阶梯，适合辅助连接' },
  { name: 'EdgeType.DashedRounded', description: '虚线圆角 - 虚线圆角折线，适合辅助连接' },
  { name: 'EdgeType.JumpLine', description: '跳线 - 带交叉跳线效果的直线，用于表示边之间的交叉关系' },
];

// 示例 1: 直线边
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 1: 直线边 (Straight)
// 创建源节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '起点',
  x: 100,
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

// 创建目标节点
const node2 = graph.addNode({
  id: 'node-2',
  label: '终点',
  x: 400,
  y: 150,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

// 添加端口
node1.addPort({ id: 'port-out', position: 'right', visible: true });
node2.addPort({ id: 'port-in', position: 'left', visible: true });

// 创建直线边
graph.addEdge({
  id: 'edge-straight',
  source: { nodeId: 'node-1', portId: 'port-out' },
  target: { nodeId: 'node-2', portId: 'port-in' },
  label: '直线边',
  type: EdgeType.Straight,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    arrowSize: 10,
  },
});`;

// 示例 2: 折线边
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 2: 折线边 (Horizontal & Vertical)
// 水平折线示例
const node1 = graph.addNode({
  id: 'node-1',
  label: '左节点',
  x: 80,
  y: 80,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '右节点',
  x: 350,
  y: 80,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#ec4899',
    borderColor: '#db2777',
    textColor: '#ffffff',
  },
});

node1.addPort({ id: 'port-right', position: 'right', visible: true });
node2.addPort({ id: 'port-left', position: 'left', visible: true });

// 水平折线
graph.addEdge({
  id: 'edge-horizontal',
  source: { nodeId: 'node-1', portId: 'port-right' },
  target: { nodeId: 'node-2', portId: 'port-left' },
  label: '水平折线',
  type: EdgeType.Horizontal,
  style: {
    stroke: '#06b6d4',
    strokeWidth: 2,
  },
});

// 垂直折线示例
const node3 = graph.addNode({
  id: 'node-3',
  label: '上节点',
  x: 200,
  y: 180,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#f97316',
    borderColor: '#ea580c',
    textColor: '#ffffff',
  },
});

const node4 = graph.addNode({
  id: 'node-4',
  label: '下节点',
  x: 200,
  y: 300,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#84cc16',
    borderColor: '#65a30d',
    textColor: '#ffffff',
  },
});

node3.addPort({ id: 'port-bottom', position: 'bottom', visible: true });
node4.addPort({ id: 'port-top', position: 'top', visible: true });

// 垂直折线
graph.addEdge({
  id: 'edge-vertical',
  source: { nodeId: 'node-3', portId: 'port-bottom' },
  target: { nodeId: 'node-4', portId: 'port-top' },
  label: '垂直折线',
  type: EdgeType.Vertical,
  style: {
    stroke: '#ec4899',
    strokeWidth: 2,
  },
});`;

// 示例 3: 曲线边
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 3: 曲线边 (Bezier & Arc)
// 贝塞尔曲线
const node1 = graph.addNode({
  id: 'node-1',
  label: '起点',
  x: 80,
  y: 100,
  shape: Shape.Circle,
  style: {
    width: 70,
    height: 70,
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
    textColor: '#ffffff',
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '终点',
  x: 400,
  y: 100,
  shape: Shape.Circle,
  style: {
    width: 70,
    height: 70,
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
    textColor: '#ffffff',
  },
});

node1.addPort({ id: 'port-out', position: 'right', visible: true });
node2.addPort({ id: 'port-in', position: 'left', visible: true });

// 贝塞尔曲线
graph.addEdge({
  id: 'edge-bezier',
  source: { nodeId: 'node-1', portId: 'port-out' },
  target: { nodeId: 'node-2', portId: 'port-in' },
  label: '贝塞尔曲线',
  type: EdgeType.Bezier,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 2,
    arrowSize: 8,
  },
});

// 弧线示例
const node3 = graph.addNode({
  id: 'node-3',
  label: 'A',
  x: 150,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 60,
    height: 60,
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
    textColor: '#ffffff',
  },
});

const node4 = graph.addNode({
  id: 'node-4',
  label: 'B',
  x: 350,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 60,
    height: 60,
    backgroundColor: '#f43f5e',
    borderColor: '#e11d48',
    textColor: '#ffffff',
  },
});

node3.addPort({ id: 'port-out', position: 'right', visible: true });
node4.addPort({ id: 'port-in', position: 'left', visible: true });

// 弧线
graph.addEdge({
  id: 'edge-arc',
  source: { nodeId: 'node-3', portId: 'port-out' },
  target: { nodeId: 'node-4', portId: 'port-in' },
  label: '弧线',
  type: EdgeType.Arc,
  style: {
    stroke: '#10b981',
    strokeWidth: 2,
    arrowSize: 8,
  },
});`;

// 示例 4: 样式配置
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 4: 边的样式配置
// 创建节点
const nodes = [
  { id: 'node-1', x: 80, y: 80, color: '#3b82f6' },
  { id: 'node-2', x: 280, y: 80, color: '#22c55e' },
  { id: 'node-3', x: 450, y: 80, color: '#f59e0b' },
  { id: 'node-4', x: 80, y: 180, color: '#8b5cf6' },
  { id: 'node-5', x: 280, y: 180, color: '#ec4899' },
];

nodes.forEach((n, i) => {
  const node = graph.addNode({
    id: n.id,
    label: String.fromCharCode(65 + i),
    x: n.x,
    y: n.y,
    shape: Shape.Circle,
    style: {
      width: 60,
      height: 60,
      backgroundColor: n.color,
      borderColor: n.color,
      textColor: '#ffffff',
    },
  });
  node.addPort({ id: 'port', position: i < 3 ? 'bottom' : 'top', visible: true });
});

// 虚线样式
graph.addEdge({
  id: 'edge-dashed',
  source: { nodeId: 'node-1', portId: 'port' },
  target: { nodeId: 'node-2', portId: 'port' },
  label: '虚线',
  type: EdgeType.Straight,
  style: {
    stroke: '#64748b',
    strokeWidth: 2,
    dashed: true,
    dashArray: '5,5',
  },
});

// 粗线样式
graph.addEdge({
  id: 'edge-thick',
  source: { nodeId: 'node-2', portId: 'port' },
  target: { nodeId: 'node-3', portId: 'port' },
  label: '粗线',
  type: EdgeType.Straight,
  style: {
    stroke: '#f59e0b',
    strokeWidth: 4,
  },
});

// 带箭头
graph.addEdge({
  id: 'edge-arrow',
  source: { nodeId: 'node-4', portId: 'port' },
  target: { nodeId: 'node-5', portId: 'port' },
  label: '带箭头',
  type: EdgeType.Straight,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 2,
    arrowSize: 12,
  },
});

// 悬停效果
graph.addEdge({
  id: 'edge-hover',
  source: { nodeId: 'node-1', portId: 'port' },
  target: { nodeId: 'node-5', portId: 'port' },
  label: '悬停变色',
  type: EdgeType.Bezier,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    hoverStroke: '#ef4444',
  },
});`;

// 示例 5: 多端口连接
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 5: 多端口连接
// 源节点（多输出端口）
const sourceNode = graph.addNode({
  id: 'source',
  label: '多输出源',
  x: 80,
  y: 175,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 100,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

// 添加多个输出端口
sourceNode.addPort({ id: 'out-1', position: 'right', visible: true });
sourceNode.addPort({ id: 'out-2', position: 'right', visible: true });
sourceNode.addPort({ id: 'out-3', position: 'right', visible: true });

// 目标节点（多输入端口）
const targetNode = graph.addNode({
  id: 'target',
  label: '多输入目标',
  x: 400,
  y: 175,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 100,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 添加多个输入端口
targetNode.addPort({ id: 'in-1', position: 'left', visible: true });
targetNode.addPort({ id: 'in-2', position: 'left', visible: true });
targetNode.addPort({ id: 'in-3', position: 'left', visible: true });

// 连接多条边（不同样式）
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'source', portId: 'out-1' },
  target: { nodeId: 'target', portId: 'in-1' },
  label: '连接 1',
  type: EdgeType.Horizontal,
  style: { stroke: '#3b82f6', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'source', portId: 'out-2' },
  target: { nodeId: 'target', portId: 'in-2' },
  label: '连接 2',
  type: EdgeType.Horizontal,
  style: { stroke: '#22c55e', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-3',
  source: { nodeId: 'source', portId: 'out-3' },
  target: { nodeId: 'target', portId: 'in-3' },
  label: '连接 3',
  type: EdgeType.Horizontal,
  style: { stroke: '#f59e0b', strokeWidth: 2 },
});`;

// 示例 6: 边事件
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
const node1 = graph.addNode({
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

const node2 = graph.addNode({
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

node1.addPort({ id: 'port-out', position: 'right', visible: true });
node2.addPort({ id: 'port-in', position: 'left', visible: true });

// 创建边
const edge = graph.addEdge({
  id: 'edge-demo',
  source: { nodeId: 'node-source', portId: 'port-out' },
  target: { nodeId: 'node-target', portId: 'port-in' },
  label: '事件边',
  type: EdgeType.Bezier,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 3,
    hoverStroke: '#8b5cf6',
    selectedStroke: '#f59e0b',
  },
});

// 绑定各种边事件
graph.on('edge:mouseenter', (e) => {
  addLog(\`🖱️ 鼠标进入边: \${e.edge.getLabel()}\`);
  e.edge.setStyle({ strokeWidth: 5 });
});

graph.on('edge:mouseleave', (e) => {
  addLog(\`🖱️ 鼠标离开边: \${e.edge.getLabel()}\`);
  e.edge.setStyle({ strokeWidth: 3 });
});

graph.on('edge:mousedown', (e) => {
  addLog(\`🖱️ 鼠标按下边: \${e.edge.getLabel()}\`);
});

graph.on('edge:mouseup', (e) => {
  addLog(\`🖱️ 鼠标释放边: \${e.edge.getLabel()}\`);
});

graph.on('edge:click', (e) => {
  addLog(\`👆 点击边: \${e.edge.getLabel()}\`);
  const label = e.edge.getLabel();
  addLog(\`   源节点: \${e.edge.getSource().nodeId} → 目标节点: \${e.edge.getTarget().nodeId}\`);
});

graph.on('edge:dblclick', (e) => {
  addLog(\`👆👆 双击边: \${e.edge.getLabel()}\`);
});

graph.on('edge:selected', (e) => {
  addLog(\`☑️ 边被选中: \${e.edge.getLabel()}\`);
});

graph.on('edge:unselected', (e) => {
  addLog(\`⬜ 边取消选中: \${e.edge.getLabel()}\`);
});

// 监听节点移动时边的更新
graph.on('node:drag', (e) => {
  const pos = e.node.getPosition();
  if (Math.floor(Date.now() / 100) % 20 === 0) {
    addLog(\`🔄 节点移动中: \${e.node.getLabel()} 位置: (\${Math.round(pos.x)}, \${Math.round(pos.y)})\`);
  }
});

addLog('边事件监听已启动，请与边交互...');`;

// 示例 7: 流动波浪效果
const EXAMPLE_7_CODE = `// 创建 Graph 画布
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
  label: '数据源',
  x: 100,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '处理器',
  x: 350,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
});

const node3 = graph.addNode({
  id: 'node-3',
  label: '输出',
  x: 350,
  y: 300,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#10b981',
    borderColor: '#059669',
    textColor: '#ffffff',
  },
});

const node4 = graph.addNode({
  id: 'node-4',
  label: '存储',
  x: 500,
  y: 200,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});

// 添加连接桩
node1.addPort({ id: 'port-right', position: 'right', visible: true });
node2.addPort({ id: 'port-left', position: 'left', visible: true });
node2.addPort({ id: 'port-right', position: 'right', visible: true });
node3.addPort({ id: 'port-left', position: 'left', visible: true });
node3.addPort({ id: 'port-right', position: 'right', visible: true });
node4.addPort({ id: 'port-left', position: 'left', visible: true });

// 创建边（初始不启用动画）
const edge1 = graph.addEdge({
  id: 'edge-flow-1',
  source: { nodeId: 'node-1', portId: 'port-right' },
  target: { nodeId: 'node-2', portId: 'port-left' },
  label: '数据流',
  type: EdgeType.Bezier,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 3,
    arrowSize: 10,
  },
});

const edge2 = graph.addEdge({
  id: 'edge-flow-2',
  source: { nodeId: 'node-1', portId: 'port-right' },
  target: { nodeId: 'node-3', portId: 'port-left' },
  label: '控制流',
  type: EdgeType.Bezier,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 3,
    arrowSize: 10,
  },
});

const edge3 = graph.addEdge({
  id: 'edge-flow-3',
  source: { nodeId: 'node-2', portId: 'port-right' },
  target: { nodeId: 'node-4', portId: 'port-left' },
  label: '输出 1',
  type: EdgeType.Horizontal,
  style: {
    stroke: '#10b981',
    strokeWidth: 3,
    arrowSize: 10,
  },
});

const edge4 = graph.addEdge({
  id: 'edge-flow-4',
  source: { nodeId: 'node-3', portId: 'port-right' },
  target: { nodeId: 'node-4', portId: 'port-left' },
  label: '输出 2',
  type: EdgeType.Horizontal,
  style: {
    stroke: '#f59e0b',
    strokeWidth: 3,
    arrowSize: 10,
  },
});

// 日志输出
const addLog = (message) => {
  console.log('[Flow]', message);
};

// 启动 edge1 的流动动画（使用默认配置）
edge1.startAnimation();

// 启动 edge2 的流动动画（自定义波浪配置）
edge2.startAnimation({
  waveColor: '#a78bfa',
  waveWidth: 2,
  waveLength: 12,
  waveSpeed: 1.5,
  waveOpacity: 0.6,
});

// 启动 edge3 的流动动画
edge3.startAnimation({
  waveColor: '#34d399',
  waveWidth: 2,
  waveLength: 10,
  waveSpeed: 2,
  waveOpacity: 0.65,
});

// 启动 edge4 的流动动画
edge4.startAnimation({
  waveColor: '#fbbf24',
  waveWidth: 2,
  waveLength: 11,
  waveSpeed: 1.8,
  waveOpacity: 0.65,
});

// 监听边点击事件 - 点击边时保持动画继续播放
graph.on('edge:click', (e) => {
  const edge = e.edge;
  const label = edge.getLabel();
  
  // 点击边时保持动画继续播放，不停止动画
  // 如需手动控制动画，可使用 edge.startAnimation() / edge.stopAnimation()
  addLog('点击边: ' + label + (edge.isAnimationPlaying() ? ' (动画播放中)' : ''));
});

addLog('流动波浪动画示例 - 动画将持续播放');`
// 示例 8: 层级 zIndex（线条交叉时的层级控制）
const EXAMPLE_8_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建 4 个节点，排成矩形
const node1 = graph.addNode({
  id: 'node-1',
  label: 'A',
  x: 100,
  y: 80,
  shape: Shape.Circle,
  style: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: 'B',
  x: 500,
  y: 80,
  shape: Shape.Circle,
  style: {
    width: 60,
    height: 60,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

const node3 = graph.addNode({
  id: 'node-3',
  label: 'C',
  x: 100,
  y: 220,
  shape: Shape.Circle,
  style: {
    width: 60,
    height: 60,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

const node4 = graph.addNode({
  id: 'node-4',
  label: 'D',
  x: 500,
  y: 220,
  shape: Shape.Circle,
  style: {
    width: 60,
    height: 60,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});

// 添加端口
node1.addPort({ id: 'p1', position: 'right', visible: true });
node1.addPort({ id: 'p2', position: 'bottom', visible: true });
node2.addPort({ id: 'p3', position: 'left', visible: true });
node2.addPort({ id: 'p4', position: 'bottom', visible: true });
node3.addPort({ id: 'p5', position: 'top', visible: true });
node3.addPort({ id: 'p6', position: 'right', visible: true });
node4.addPort({ id: 'p7', position: 'top', visible: true });
node4.addPort({ id: 'p8', position: 'left', visible: true });

// 创建交叉的边，演示 zIndex 层级效果
// A -> D (红色，zIndex=0，在底层)
graph.addEdge({
  id: 'edge-ad',
  source: { nodeId: 'node-1', portId: 'p2' },
  target: { nodeId: 'node-4', portId: 'p7' },
  label: 'zIndex=0',
  type: EdgeType.Straight,
  zIndex: 0,
  style: {
    stroke: '#ef4444',
    strokeWidth: 4,
    arrowSize: 10,
  },
});

// C -> B (蓝色，zIndex=1，在上层)
graph.addEdge({
  id: 'edge-cb',
  source: { nodeId: 'node-3', portId: 'p6' },
  target: { nodeId: 'node-2', portId: 'p3' },
  label: 'zIndex=1',
  type: EdgeType.Straight,
  zIndex: 1,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 4,
    arrowSize: 10,
  },
});

// 添加其他边形成复杂交叉
// A -> B (绿色，zIndex=2)
graph.addEdge({
  id: 'edge-ab',
  source: { nodeId: 'node-1', portId: 'p1' },
  target: { nodeId: 'node-2', portId: 'p3' },
  label: 'zIndex=2',
  type: EdgeType.Straight,
  zIndex: 2,
  style: {
    stroke: '#22c55e',
    strokeWidth: 3,
    arrowSize: 8,
  },
});

// C -> D (紫色，zIndex=3，在最上层)
graph.addEdge({
  id: 'edge-cd',
  source: { nodeId: 'node-3', portId: 'p6' },
  target: { nodeId: 'node-4', portId: 'p8' },
  label: 'zIndex=3',
  type: EdgeType.Straight,
  zIndex: 3,
  style: {
    stroke: '#a855f7',
    strokeWidth: 4,
    arrowSize: 10,
  },
});

console.log('zIndex 层级示例：观察交叉线条，zIndex 越大的线条显示在上层');`;

// 示例 9: 阶梯折线边（新增类型展示）
const EXAMPLE_9_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 800,
  height: 500,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 9: 阶梯折线边展示（对应图片中的8种模式）
// 创建起始节点（左上）
const startNode = graph.addNode({
  id: 'start',
  label: '起点',
  x: 50,
  y: 50,
  shape: Shape.Rect,
  style: {
    width: 80,
    height: 40,
    backgroundColor: '#475569',
    borderColor: '#334155',
    textColor: '#ffffff',
  },
});

// 创建目标节点（4列 x 2行 = 8个节点）
const targets = [
  // 第一行 - 斜向（类似图片上行）
  { id: 't1', x: 200, y: 150, label: 'StepRight', color: '#1f2937' },
  { id: 't2', x: 350, y: 150, label: 'RoundedRight', color: '#ef4444' },
  { id: 't3', x: 500, y: 150, label: 'SmoothStep', color: '#f59e0b' },
  { id: 't4', x: 650, y: 150, label: 'DashedStep', color: '#3b82f6' },
  // 第二行 - 直角（类似图片下行）
  { id: 't5', x: 200, y: 350, label: 'StepDown', color: '#1f2937' },
  { id: 't6', x: 350, y: 350, label: 'RoundedDown', color: '#ef4444' },
  { id: 't7', x: 500, y: 350, label: 'Orthogonal', color: '#f59e0b' },
  { id: 't8', x: 650, y: 350, label: 'DashedRounded', color: '#3b82f6' },
];

targets.forEach(t => {
  const node = graph.addNode({
    id: t.id,
    label: t.label,
    x: t.x,
    y: t.y,
    shape: Shape.Rect,
    style: {
      width: 100,
      height: 40,
      backgroundColor: t.color,
      borderColor: t.color,
      textColor: '#ffffff',
      fontSize: 11,
    },
  });
  node.addPort({ id: 'port-in', position: 'left', visible: true });
});

startNode.addPort({ id: 'port-out', position: 'bottom', visible: true });

// 阶梯折线（先水平后垂直）- 黑色直角
graph.addEdge({
  id: 'edge-step-right',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't1', portId: 'port-in' },
  type: EdgeType.StepRight,
  style: {
    stroke: '#1f2937',
    strokeWidth: 2,
    arrowSize: 10,
  },
});

// 圆角阶梯（先水平后垂直）- 红色圆角
graph.addEdge({
  id: 'edge-rounded-right',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't2', portId: 'port-in' },
  type: EdgeType.RoundedStepRight,
  style: {
    stroke: '#ef4444',
    strokeWidth: 2,
    cornerRadius: 12,
    arrowSize: 10,
  },
});

// 平滑 L 型 - 黄色平滑
graph.addEdge({
  id: 'edge-smooth-step',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't3', portId: 'port-in' },
  type: EdgeType.SmoothStep,
  style: {
    stroke: '#f59e0b',
    strokeWidth: 2,
    cornerRadius: 15,
    arrowSize: 10,
  },
});

// 虚线阶梯 - 蓝色虚线
graph.addEdge({
  id: 'edge-dashed-step',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't4', portId: 'port-in' },
  type: EdgeType.DashedStep,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    dashed: true,
    dashPattern: [8, 4],
    arrowSize: 10,
  },
});

// 阶梯折线（先垂直后水平）- 黑色直角（下行）
graph.addEdge({
  id: 'edge-step-down',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't5', portId: 'port-in' },
  type: EdgeType.StepDown,
  style: {
    stroke: '#1f2937',
    strokeWidth: 2,
    arrowSize: 10,
  },
});

// 圆角阶梯（先垂直后水平）- 红色圆角（下行）
graph.addEdge({
  id: 'edge-rounded-down',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't6', portId: 'port-in' },
  type: EdgeType.RoundedStepDown,
  style: {
    stroke: '#ef4444',
    strokeWidth: 2,
    cornerRadius: 12,
    arrowSize: 10,
  },
});

// 正交折线 - 智能路由
graph.addEdge({
  id: 'edge-orthogonal',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't7', portId: 'port-in' },
  type: EdgeType.Orthogonal,
  style: {
    stroke: '#f59e0b',
    strokeWidth: 2,
    cornerRadius: 8,
    arrowSize: 10,
  },
});

// 虚线圆角 - 蓝色虚线圆角（下行）
graph.addEdge({
  id: 'edge-dashed-rounded',
  source: { nodeId: 'start', portId: 'port-out' },
  target: { nodeId: 't8', portId: 'port-in' },
  type: EdgeType.DashedRounded,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    dashed: true,
    dashPattern: [10, 5],
    cornerRadius: 12,
    arrowSize: 10,
  },
});

console.log('阶梯折线示例：展示了8种新的边类型');
console.log('上行（斜向）：StepRight, RoundedStepRight, SmoothStep, DashedStep');
console.log('下行（直角）：StepDown, RoundedStepDown, Orthogonal, DashedRounded');`;

// 示例 10: 跳线（交叉跳线效果）
const EXAMPLE_10_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 800,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建上方一排节点
const topNodes = [];
for (let i = 0; i < 5; i++) {
  const node = graph.addNode({
    id: 'top-' + i,
    label: '上' + (i + 1),
    x: 150 + i * 120,
    y: 50,
    shape: Shape.Rect,
    style: {
      width: 80,
      height: 40,
      backgroundColor: '#e2e8f0',
      borderColor: '#94a3b8',
      textColor: '#475569',
    },
  });
  node.addPort({ id: 'bottom', position: 'bottom', visible: true });
  topNodes.push(node);
}

// 创建下方一排节点
const bottomNodes = [];
for (let i = 0; i < 5; i++) {
  const node = graph.addNode({
    id: 'bottom-' + i,
    label: '下' + (i + 1),
    x: 150 + i * 120,
    y: 250,
    shape: Shape.Rect,
    style: {
      width: 80,
      height: 40,
      backgroundColor: '#f1f5f9',
      borderColor: '#cbd5e1',
      textColor: '#64748b',
    },
  });
  node.addPort({ id: 'top', position: 'top', visible: true });
  bottomNodes.push(node);
}

// 创建左侧节点
const leftNode = graph.addNode({
  id: 'left-start',
  label: '起点',
  x: 30,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 80,
    height: 40,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
});
leftNode.addPort({ id: 'out', position: 'right', visible: true });

// 创建右侧终点节点
const rightNode = graph.addNode({
  id: 'right-end',
  label: '终点',
  x: 700,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 80,
    height: 40,
    backgroundColor: '#10b981',
    borderColor: '#059669',
    textColor: '#ffffff',
  },
});
rightNode.addPort({ id: 'in', position: 'left', visible: true });

// 创建垂直连接线（上方节点到下方节点）- 这些会被水平跳线"跳过"
const verticalEdges = [];
for (let i = 0; i < 5; i++) {
  const edge = graph.addEdge({
    id: 'vertical-' + i,
    source: { nodeId: 'top-' + i, portId: 'bottom' },
    target: { nodeId: 'bottom-' + i, portId: 'top' },
    type: EdgeType.Straight,
    style: {
      stroke: '#f59e0b',
      strokeWidth: 2,
      arrowSize: 8,
      arrowColor: '#f59e0b',
    },
  });
  verticalEdges.push(edge);
}

// 创建水平跳线（从左侧穿过垂直线到右侧）
// 第一条跳线 - 穿过所有垂直线
graph.addEdge({
  id: 'jump-1',
  source: { nodeId: 'left-start', portId: 'out' },
  target: { nodeId: 'right-end', portId: 'in' },
  label: '跳线 1',
  type: EdgeType.JumpLine,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 3,
    arrowSize: 10,
    arrowColor: '#8b5cf6',
    jumpHeight: 12,
    jumpWidth: 20,
  },
});

// 创建第二条水平跳线（稍偏下）
const leftNode2 = graph.addNode({
  id: 'left-start-2',
  label: '起点2',
  x: 30,
  y: 180,
  shape: Shape.Rect,
  style: {
    width: 80,
    height: 40,
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
    textColor: '#ffffff',
  },
});
leftNode2.addPort({ id: 'out', position: 'right', visible: true });

const rightNode2 = graph.addNode({
  id: 'right-end-2',
  label: '终点2',
  x: 700,
  y: 180,
  shape: Shape.Rect,
  style: {
    width: 80,
    height: 40,
    backgroundColor: '#06b6d4',
    borderColor: '#0891b2',
    textColor: '#ffffff',
  },
});
rightNode2.addPort({ id: 'in', position: 'left', visible: true });

graph.addEdge({
  id: 'jump-2',
  source: { nodeId: 'left-start-2', portId: 'out' },
  target: { nodeId: 'right-end-2', portId: 'in' },
  label: '跳线 2',
  type: EdgeType.JumpLine,
  style: {
    stroke: '#6366f1',
    strokeWidth: 3,
    arrowSize: 10,
    arrowColor: '#6366f1',
    jumpHeight: 10,
    jumpWidth: 16,
  },
});

console.log('跳线示例：展示了带交叉跳线效果的边');
console.log('水平边线在穿过垂直边线时，会绘制拱形跳线标记表示"跳过"关系');`;

// 示例 11: 边移动（拖拽边而不改变连接节点）
const EXAMPLE_11_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 450,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建日志显示区域
const logContainer = document.createElement('div');
logContainer.style.cssText = 'position:absolute;bottom:8px;left:8px;right:8px;height:80px;background:#1e293b;color:#e2e8f0;padding:8px;borderRadius:6px;overflow:auto;fontSize:12px;fontFamily:monospace;';
container.appendChild(logContainer);

const addLog = (msg) => {
  const line = document.createElement('div');
  line.textContent = '[\${new Date().toLocaleTimeString()}] ' + msg;
  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
};

// 创建左侧节点
const leftNode = graph.addNode({
  id: 'node-left',
  label: '源节点',
  x: 80,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

// 创建右侧节点
const rightNode = graph.addNode({
  id: 'node-right',
  label: '目标节点',
  x: 520,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 添加端口
leftNode.addPort({ id: 'port-out', position: 'right', visible: true });
rightNode.addPort({ id: 'port-in', position: 'left', visible: true });

// 创建各种类型的边供拖拽测试
const edges = [];

// 直线边
const edge1 = graph.addEdge({
  id: 'edge-straight',
  source: { nodeId: 'node-left', portId: 'port-out' },
  target: { nodeId: 'node-right', portId: 'port-in' },
  label: '直线（可拖动）',
  type: EdgeType.Straight,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 3,
    arrowSize: 10,
    hoverStroke: '#a78bfa',
    selectedStroke: '#f59e0b',
  },
});
edges.push(edge1);

// 贝塞尔曲线边
const edge2 = graph.addEdge({
  id: 'edge-bezier',
  source: { nodeId: 'node-left', portId: 'port-out' },
  target: { nodeId: 'node-right', portId: 'port-in' },
  label: '贝塞尔曲线（可拖动）',
  type: EdgeType.Bezier,
  style: {
    stroke: '#f59e0b',
    strokeWidth: 3,
    arrowSize: 10,
    hoverStroke: '#fbbf24',
    selectedStroke: '#f59e0b',
  },
});
edges.push(edge2);

// 添加控制按钮
const buttonContainer = document.createElement('div');
buttonContainer.style.cssText = 'position:absolute;top:8px;left:8px;display:flex;gap:8px;';
container.appendChild(buttonContainer);

// 重置偏移按钮
const resetBtn = document.createElement('button');
resetBtn.textContent = '重置所有边位置';
resetBtn.style.cssText = 'padding:6px 12px;background:#3b82f6;color:#fff;border:none;borderRadius:4px;cursor:pointer;fontSize:12px;';
resetBtn.onclick = () => {
  edges.forEach(edge => {
    edge.resetOffset();
  });
  addLog('已重置所有边的位置');
  graph.scheduleRender();
};
buttonContainer.appendChild(resetBtn);

// 随机偏移按钮
const randomBtn = document.createElement('button');
randomBtn.textContent = '随机偏移';
randomBtn.style.cssText = 'padding:6px 12px;background:#22c55e;color:#fff;border:none;borderRadius:4px;cursor:pointer;fontSize:12px;';
randomBtn.onclick = () => {
  edges.forEach(edge => {
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 60;
    edge.setOffset(offsetX, offsetY);
  });
  addLog('已随机偏移所有边');
  graph.scheduleRender();
};
buttonContainer.appendChild(randomBtn);

// 显示偏移信息
const infoBtn = document.createElement('button');
infoBtn.textContent = '查看偏移信息';
infoBtn.style.cssText = 'padding:6px 12px;background:#8b5cf6;color:#fff;border:none;borderRadius:4px;cursor:pointer;fontSize:12px;';
infoBtn.onclick = () => {
  edges.forEach(edge => {
    const offset = edge.getOffset();
    addLog('边 "' + edge.getLabel() + '" 偏移: (' + offset.x.toFixed(1) + ', ' + offset.y.toFixed(1) + ')');
  });
};
buttonContainer.appendChild(infoBtn);

// 监听边选中事件
graph.on('edge:selected', (e) => {
  const offset = e.edge.getOffset();
  addLog('选中边: ' + e.edge.getLabel() + '，当前偏移: (' + offset.x.toFixed(1) + ', ' + offset.y.toFixed(1) + ')');
});

// 监听画布空白点击，显示提示
graph.on('blank:click', () => {
  addLog('提示：鼠标悬停在边上，光标变为 move 时可拖动边');
});

addLog('边移动示例已加载');
addLog('操作说明：');
addLog('1. 鼠标悬停在边上，光标变为 move');
addLog('2. 按住鼠标拖动即可移动边');
addLog('3. 连接到的节点位置不会改变');
addLog('4. 偏移量会自动保存到 JSON');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '直线边', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '折线边', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '曲线边', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '样式配置', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '多端口连接', code: EXAMPLE_5_CODE },
  { id: 'example-6', title: '边事件', code: EXAMPLE_6_CODE },
  { id: 'example-7', title: '流动波浪', code: EXAMPLE_7_CODE },
  { id: 'example-8', title: '层级 zIndex', code: EXAMPLE_8_CODE },
  { id: 'example-9', title: '阶梯折线边', code: EXAMPLE_9_CODE },
  { id: 'example-10', title: '跳线边', code: EXAMPLE_10_CODE },
  { id: 'example-11', title: '边移动', code: EXAMPLE_11_CODE },
];

/**
 * EdgeExample - Edge 边组件使用示例
 */
export const EdgeExample: React.FC = () => {
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

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
        EdgeType,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, EdgeType } = sandbox;
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
        <div id="edge-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            EdgeOptions - 边配置选项
          </h3>
          <Table columns={edgeOptionsColumns} dataSource={edgeOptionsData} pagination={false} />
        </div>
        <div id="edge-style-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            EdgeStyle - 边样式配置（含流动波浪）
          </h3>
          <Table columns={edgeStyleColumns} dataSource={edgeStyleData} pagination={false} />
        </div>
        <div id="edge-type-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            EdgeType - 边类型枚举
          </h3>
          <Table columns={edgeTypeColumns} dataSource={edgeTypeData} pagination={false} />
        </div>
        <div id="edge-methods-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Edge 类方法</h3>
          <Table columns={edgeMethodsColumns} dataSource={edgeMethodsData} pagination={false} />
        </div>
        <div id="edge-events-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Edge 事件</h3>
          <Table columns={edgeEventColumns} dataSource={edgeEventData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="edge-example-title" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <PanelHeader title="Edge 边组件示例" />
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
          <Anchor.Link href="#edge-example-title" title="Edge 边组件示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#edge-options-section" title="EdgeOptions" />
          <Anchor.Link href="#edge-style-section" title="EdgeStyle" />
          <Anchor.Link href="#edge-type-section" title="EdgeType 枚举" />
          <Anchor.Link href="#edge-methods-section" title="Edge 类方法" />
          <Anchor.Link href="#edge-events-section" title="Edge 事件" />
        </Anchor>
      </div>
    </div>
  );
};

export default EdgeExample;
