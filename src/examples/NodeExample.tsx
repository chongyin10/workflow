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

// NodeOptions 表格数据
const nodeOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const nodeOptionsData = [
  { name: 'id', type: 'string', required: '是', default: '-', description: '节点唯一标识符' },
  { name: 'label', type: 'string', required: '否', default: "''", description: '节点显示文本' },
  { name: 'x', type: 'number', required: '是', default: '-', description: '节点 X 坐标' },
  { name: 'y', type: 'number', required: '是', default: '-', description: '节点 Y 坐标' },
  { name: 'shape', type: 'Shape | ShapeConfig', required: '否', default: 'Shape.Rect', description: '节点形状类型' },
  { name: 'style', type: 'NodeStyle', required: '否', default: '{}', description: '节点样式配置' },
  { name: 'data', type: 'Record<string, any>', required: '否', default: '{}', description: '自定义业务数据' },
  { name: 'visible', type: 'boolean', required: '否', default: 'true', description: '是否可见' },
  { name: 'locked', type: 'boolean', required: '否', default: 'false', description: '是否锁定（不可交互）' },
];

// Node 类方法表格数据
const nodeMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 200 },
  { title: '参数', dataIndex: 'params', width: 250 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const nodeMethodsData = [
  { key: '1', name: 'getId()', params: '-', return: 'string', description: '获取节点唯一 ID' },
  { key: '2', name: 'getLabel() / setLabel(label)', params: 'label: string', return: 'string / void', description: '获取/设置节点标签' },
  { key: '3', name: 'getPosition() / setPosition(x, y)', params: 'x: number, y: number', return: 'Point / void', description: '获取/设置节点位置' },
  { key: '4', name: 'move(dx, dy)', params: 'dx: number, dy: number', return: 'void', description: '相对移动节点' },
  { key: '5', name: 'getStyle() / setStyle(style)', params: 'style: Partial<NodeStyle>', return: 'NodeStyle / void', description: '获取/设置节点样式' },
  { key: '6', name: 'getData() / setData(data)', params: 'data: Record<string, any>', return: 'any / void', description: '获取/设置业务数据' },
  { key: '7', name: 'addPort(options)', params: 'options: PortOptions', return: 'Port', description: '添加连接桩到节点' },
  { key: '8', name: 'removePort(portId)', params: 'portId: string', return: 'boolean', description: '移除指定连接桩' },
  { key: '9', name: 'getPort(portId)', params: 'portId: string', return: 'Port | undefined', description: '获取指定连接桩' },
  { key: '10', name: 'getAllPorts()', params: '-', return: 'Port[]', description: '获取所有连接桩' },
  { key: '11', name: 'addPortGroup(options)', params: 'options: PortGroupOptions', return: 'Port[]', description: '批量添加连接桩（自动布局）' },
  { key: '12', name: 'clearPorts()', params: '-', return: 'void', description: '清除所有连接桩' },
  { key: '13', name: 'toJSON()', params: '-', return: 'object', description: '序列化为 JSON' },
  { key: '14', name: 'clone()', params: '-', return: 'Node', description: '克隆节点' },
];

// 示例 1: 基础形状
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 250,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 1: 基础形状展示
// Rect - 矩形
const rectNode = graph.addNode({
  id: 'node-rect',
  label: '矩形',
  x: 100,
  y: 80,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    borderWidth: 2,
    borderRadius: 8,
    textColor: '#ffffff',
  },
});

// Circle - 圆形
const circleNode = graph.addNode({
  id: 'node-circle',
  label: '圆形',
  x: 280,
  y: 80,
  shape: Shape.Circle,
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    borderWidth: 2,
    textColor: '#ffffff',
  },
});

// Ellipse - 椭圆
const ellipseNode = graph.addNode({
  id: 'node-ellipse',
  label: '椭圆',
  x: 450,
  y: 80,
  shape: Shape.Ellipse,
  style: {
    width: 140,
    height: 80,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    borderWidth: 2,
    textColor: '#ffffff',
  },
});`;

// 示例 2: 样式效果
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 250,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 2: 样式效果展示
// 阴影效果
const shadowNode = graph.addNode({
  id: 'node-shadow',
  label: '阴影效果',
  x: 100,
  y: 80,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 70,
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
    borderWidth: 2,
    borderRadius: 12,
    textColor: '#ffffff',
    shadowColor: 'rgba(14, 165, 233, 0.4)',
    shadowBlur: 15,
    shadowOffsetX: 4,
    shadowOffsetY: 4,
  },
});

// 圆角样式
const roundedNode = graph.addNode({
  id: 'node-rounded',
  label: '大圆角',
  x: 280,
  y: 80,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 70,
    backgroundColor: '#ec4899',
    borderColor: '#db2777',
    borderWidth: 2,
    borderRadius: 35,
    textColor: '#ffffff',
  },
});

// 细边框样式
const thinBorderNode = graph.addNode({
  id: 'node-thin',
  label: '细边框',
  x: 450,
  y: 80,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 70,
    backgroundColor: '#f8fafc',
    borderColor: '#64748b',
    borderWidth: 1,
    borderRadius: 8,
    textColor: '#64748b',
  },
});`;

// 示例 3: 多边形
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 250,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 3: 多边形形状
// 菱形（四边形）
const diamondNode = graph.addNode({
  id: 'node-diamond',
  label: '菱形',
  x: 150,
  y: 100,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: 0, y: -50 },
      { x: 60, y: 0 },
      { x: 0, y: 50 },
      { x: -60, y: 0 },
    ],
  },
  style: {
    width: 120,
    height: 100,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    borderWidth: 2,
    textColor: '#ffffff',
  },
});

// 六边形
const hexNode = graph.addNode({
  id: 'node-hex',
  label: '六边形',
  x: 380,
  y: 100,
  shape: {
    type: Shape.Polygon,
    points: [
      { x: -40, y: -35 },
      { x: 40, y: -35 },
      { x: 80, y: 0 },
      { x: 40, y: 35 },
      { x: -40, y: 35 },
      { x: -80, y: 0 },
    ],
  },
  style: {
    width: 160,
    height: 70,
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
    borderWidth: 2,
    textColor: '#ffffff',
  },
});`;

// 示例 4: 端口管理
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 250,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 4: 端口管理
// 创建带端口的源节点
const sourceNode = graph.addNode({
  id: 'node-source',
  label: '源节点',
  x: 100,
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

// 添加多个端口
sourceNode.addPort({ id: 'port-top', position: 'top', visible: true });
sourceNode.addPort({ id: 'port-right', position: 'right', visible: true });
sourceNode.addPort({ id: 'port-bottom', position: 'bottom', visible: true });
sourceNode.addPort({ id: 'port-left', position: 'left', visible: true });

// 创建目标节点
const targetNode = graph.addNode({
  id: 'node-target',
  label: '目标节点',
  x: 350,
  y: 100,
  shape: Shape.Circle,
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

targetNode.addPort({ id: 'port-in', position: 'left', visible: true });

// 连接两个节点
graph.addEdge({
  id: 'edge-demo',
  source: { nodeId: 'node-source', portId: 'port-right' },
  target: { nodeId: 'node-target', portId: 'port-in' },
  type: EdgeType.Bezier,
  style: { stroke: '#64748b', strokeWidth: 2 },
});`;

// 示例 5: 动态交互
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 250,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 5: 动态交互演示
// 创建可交互节点
const interactiveNode = graph.addNode({
  id: 'node-interactive',
  label: '点击我！',
  x: 250,
  y: 100,
  shape: Shape.Rect,
  style: {
    width: 140,
    height: 80,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    borderWidth: 2,
    borderRadius: 8,
    textColor: '#ffffff',
    hoverBackgroundColor: '#a78bfa',
  },
  data: { clickCount: 0 },
});

// 添加监听事件
graph.on('node:click', (e) => {
  if (e.node.getId() === 'node-interactive') {
    const data = e.node.getData();
    const newCount = (data.clickCount || 0) + 1;
    e.node.setData({ ...data, clickCount: newCount });
    e.node.setLabel(\`点击了 \${newCount} 次\`);
    console.log('节点被点击！当前计数:', newCount);
  }
});

// 状态指示器节点
const statusNode = graph.addNode({
  id: 'node-status',
  label: '状态: 正常',
  x: 100,
  y: 180,
  shape: Shape.Circle,
  style: {
    width: 70,
    height: 70,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

const errorNode = graph.addNode({
  id: 'node-error',
  label: '状态: 错误',
  x: 200,
  y: 180,
  shape: Shape.Circle,
  style: {
    width: 70,
    height: 70,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

const warningNode = graph.addNode({
  id: 'node-warning',
  label: '状态: 警告',
  x: 300,
  y: 180,
  shape: Shape.Circle,
  style: {
    width: 70,
    height: 70,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础形状', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '样式效果', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '多边形', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '端口管理', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '动态交互', code: EXAMPLE_5_CODE },
];

/**
 * NodeExample - Node 节点组件使用示例
 */
export const NodeExample: React.FC = () => {
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
        <div id="node-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            NodeOptions - 节点配置选项
          </h3>
          <Table columns={nodeOptionsColumns} dataSource={nodeOptionsData} pagination={false} />
        </div>
        <div id="node-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Node 类方法</h3>
          <Table columns={nodeMethodsColumns} dataSource={nodeMethodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="node-example-title" style={{ height: '600px' }}>
        <PanelHeader title="Node 节点示例" />
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
          <Anchor.Link href="#node-example-title" title="Node 节点示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#node-options-section" title="NodeOptions" />
          <Anchor.Link href="#node-methods-section" title="Node 类方法" />
        </Anchor>
      </div>
    </div>
  );
};

export default NodeExample;
