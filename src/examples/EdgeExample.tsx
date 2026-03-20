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
];

// Edge 类方法表格数据
const edgeMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 200 },
  { title: '参数', dataIndex: 'params', width: 250 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const edgeMethodsData = [
  { key: '1', name: 'getId()', params: '-', return: 'string', description: '获取边唯一 ID' },
  { key: '2', name: 'getSource() / setSource(source)', params: 'source: ConnectionPoint', return: 'ConnectionPoint / void', description: '获取/设置源连接点' },
  { key: '3', name: 'getTarget() / setTarget(target)', params: 'target: ConnectionPoint', return: 'ConnectionPoint / void', description: '获取/设置目标连接点' },
  { key: '4', name: 'getLabel() / setLabel(label)', params: 'label: string', return: 'string / void', description: '获取/设置边标签' },
  { key: '5', name: 'getType() / setType(type)', params: 'type: EdgeType', return: 'EdgeType / void', description: '获取/设置边类型' },
  { key: '6', name: 'getStyle() / setStyle(style)', params: 'style: Partial<EdgeStyle>', return: 'EdgeStyle / void', description: '获取/设置边样式' },
  { key: '7', name: 'disconnect()', params: '-', return: 'boolean', description: '断开边连接（隐藏但不删除）' },
  { key: '8', name: 'reconnect()', params: '-', return: 'boolean', description: '重新连接边' },
  { key: '9', name: 'isConnected()', params: '-', return: 'boolean', description: '检查边是否已连接' },
  { key: '10', name: 'toJSON()', params: '-', return: 'object', description: '序列化为 JSON' },
  { key: '11', name: 'clone()', params: '-', return: 'Edge', description: '克隆边' },
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

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '直线边', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '折线边', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '曲线边', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '样式配置', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '多端口连接', code: EXAMPLE_5_CODE },
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
        <div id="edge-type-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            EdgeType - 边类型枚举
          </h3>
          <Table columns={edgeTypeColumns} dataSource={edgeTypeData} pagination={false} />
        </div>
        <div id="edge-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Edge 类方法</h3>
          <Table columns={edgeMethodsColumns} dataSource={edgeMethodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="edge-example-title" style={{ height: '600px' }}>
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
        <Splitter style={{ height: '100%' }}>
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
          <Anchor.Link href="#edge-type-section" title="EdgeType 枚举" />
          <Anchor.Link href="#edge-methods-section" title="Edge 类方法" />
        </Anchor>
      </div>
    </div>
  );
};

export default EdgeExample;
