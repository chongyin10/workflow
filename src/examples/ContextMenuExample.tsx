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

// 可用事件表格数据
const eventColumns = [
  { title: '事件名称', dataIndex: 'name', width: 200 },
  { title: '触发条件', dataIndex: 'trigger', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const eventData = [
  { name: 'node:contextmenu', trigger: '在节点上右键点击', description: '在节点上点击鼠标右键时触发' },
  { name: 'cell:contextmenu', trigger: '在单元格上右键点击', description: '在任意单元格（节点/边）上右键点击时触发' },
  { name: 'edge:contextmenu', trigger: '在边上右键点击', description: '在边上点击鼠标右键时触发' },
  { name: 'blank:contextmenu', trigger: '在空白区域右键点击', description: '在画布空白区域点击鼠标右键时触发' },
];

// 事件对象属性表格数据
const eventObjectColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const eventObjectData = [
  { name: 'type', type: 'string', description: '事件类型（如 node:contextmenu）' },
  { name: 'node', type: 'Node', description: '触发事件的节点（仅 node:contextmenu）' },
  { name: 'cell', type: 'Cell', description: '触发事件的单元格（仅 cell:contextmenu）' },
  { name: 'edge', type: 'Edge', description: '触发事件的边（仅 edge:contextmenu）' },
  { name: 'x', type: 'number', description: '鼠标 X 坐标（相对于画布世界坐标）' },
  { name: 'y', type: 'number', description: '鼠标 Y 坐标（相对于画布世界坐标）' },
  { name: 'clientX', type: 'number', description: '鼠标 X 坐标（相对于视口）' },
  { name: 'clientY', type: 'number', description: '鼠标 Y 坐标（相对于视口）' },
  { name: 'ctrlKey', type: 'boolean', description: '是否按下 Ctrl 键' },
  { name: 'shiftKey', type: 'boolean', description: '是否按下 Shift 键' },
  { name: 'altKey', type: 'boolean', description: '是否按下 Alt 键' },
  { name: 'button', type: 'number', description: '鼠标按钮（0: 左键, 1: 中键, 2: 右键）' },
  { name: 'originalEvent', type: 'MouseEvent', description: '原始 DOM 鼠标事件' },
  { name: 'preventDefault()', type: 'function', description: '阻止默认右键菜单' },
];

// 示例 1: node:contextmenu 事件
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 使用 Dropdown 插件创建右键菜单
new plugins.Dropdown(graph, {
  nodeMenu: [
    { label: '复制节点', icon: '📋', action: (node) => console.log('复制节点:', node.getLabel()) },
    { label: '删除节点', icon: '🗑️', danger: true, action: (node) => graph.removeNode(node.getId()) },
    { label: '编辑标签', icon: '✏️', action: (node) => console.log('编辑标签:', node.getLabel()) },
  ],
});

// 创建示例节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '右键点击我',
  x: 150,
  y: 150,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '或右键点击我',
  x: 400,
  y: 150,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
  },
});

console.log('node:contextmenu 事件监听已启动...');
console.log('在节点上点击鼠标右键查看效果');`;

// 示例 2: cell:contextmenu 事件
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 使用 Dropdown 插件创建右键菜单
new plugins.Dropdown(graph, {
  cellMenu: (cell) => {
    // 判断是节点还是边，返回不同的菜单
    const isNode = cell.constructor.name === 'Node';
    
    if (isNode) {
      return [
        { label: '复制节点', icon: '📋', action: () => console.log('复制节点:', cell.getLabel()) },
        { label: '删除节点', icon: '🗑️', danger: true, action: () => graph.removeNode(cell.getId()) },
        { label: '编辑标签', icon: '✏️', action: () => console.log('编辑标签:', cell.getLabel()) },
      ];
    } else {
      return [
        { label: '删除边', icon: '🗑️', danger: true, action: () => graph.removeEdge(cell.getId()) },
      ];
    }
  },
});

// 创建节点和边
const node1 = graph.addNode({
  id: 'node-1',
  label: '节点 A',
  x: 150,
  y: 150,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
    borderRadius: 8,
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '节点 B',
  x: 400,
  y: 150,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
    borderRadius: 8,
  },
});

// 添加连接边
graph.addEdge({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2.5, arrowSize: 8 },
});

console.log('cell:contextmenu 事件监听已启动...');
console.log('此事件对节点和边都有效');`;

// 示例 3: edge:contextmenu 事件
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 使用 Dropdown 插件创建右键菜单
new plugins.Dropdown(graph, {
  edgeMenu: [
    { label: '删除边', icon: '🗑️', danger: true, action: (edge) => graph.removeEdge(edge.getId()) },
  ],
});

// 创建连接的节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '开始',
  x: 150,
  y: 180,
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
  id: 'node-2',
  label: '处理',
  x: 350,
  y: 180,
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

const node3 = graph.addNode({
  id: 'node-3',
  label: '结束',
  x: 550,
  y: 180,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

// 创建多条边
graph.addEdge({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  type: EdgeType.Bezier,
  style: { stroke: '#64748b', strokeWidth: 2, arrowSize: 10 },
});

graph.addEdge({
  id: 'edge-2',
  source: 'node-2',
  target: 'node-3',
  type: EdgeType.Bezier,
  style: { stroke: '#64748b', strokeWidth: 2, arrowSize: 10 },
});

console.log('edge:contextmenu 事件监听已启动...');
console.log('在边上点击鼠标右键查看效果');`;

// 示例 4: blank:contextmenu 事件
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 使用 Dropdown 插件创建右键菜单
new plugins.Dropdown(graph, {
  blankMenu: (e) => [
    { label: '添加节点', icon: '➕', action: () => {
      const { x, y } = e;
      const newNode = graph.addNode({
        id: \`node-\${Date.now()}\`,
        label: '新节点',
        x: x - 50,
        y: y - 30,
        style: {
          width: 100,
          height: 60,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          textColor: '#ffffff',
          borderRadius: 8,
        },
      });
      console.log('添加新节点:', newNode.getId());
    }},
    { label: '清空画布', icon: '🗑️', action: () => {
      graph.clear();
      console.log('清空画布');
    }},
    { label: '适应画布', icon: '📐', action: () => {
      graph.fitView();
      console.log('适应画布');
    }},
  ],
});

// 创建几个节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '节点 1',
  x: 200,
  y: 180,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#ec4899',
    borderColor: '#db2777',
    textColor: '#ffffff',
    borderRadius: 8,
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '节点 2',
  x: 400,
  y: 180,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#06b6d4',
    borderColor: '#0891b2',
    textColor: '#ffffff',
    borderRadius: 8,
  },
});

// 监听 node:contextmenu 事件（点击节点时也关闭空白区域弹出层）
graph.on('node:contextmenu', (e) => {
  e.preventDefault?.();
  console.log('📦 节点右键菜单:', e.node.getLabel());
});

console.log('blank:contextmenu 事件监听已启动...');
console.log('在空白区域点击右键查看效果');
console.log('在节点上点击右键会触发 node:contextmenu');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: 'node:contextmenu', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: 'cell:contextmenu', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: 'edge:contextmenu', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: 'blank:contextmenu', code: EXAMPLE_4_CODE },
];

/**
 * ContextMenuExample - 右键菜单事件演示
 *
 * 本示例展示了如何使用 node:contextmenu、cell:contextmenu、edge:contextmenu 和 blank:contextmenu 事件
 */
export const ContextMenuExample: React.FC = () => {
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
      const plugins = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
        EdgeType,
        plugins,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, EdgeType, plugins } = sandbox;
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
      <PanelHeader icon="🖱️" title="右键菜单演示" hint="在元素上点击右键" />
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
        <div id="contextmenu-event-list" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>可用事件</h3>
          <p style={{ color: '#64748b', margin: '0 0 12px 0' }}>
            以下是在画布上可用的右键菜单事件。通过监听这些事件，可以实现自定义右键菜单功能。
          </p>
          <Table columns={eventColumns} dataSource={eventData} pagination={false} />
        </div>
        <div id="contextmenu-event-object-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>事件对象属性</h3>
          <Table columns={eventObjectColumns} dataSource={eventObjectData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="contextmenu-title" style={{ height: '600px' }}>
        <PanelHeader title="ContextMenu 右键菜单事件示例" />
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
          <Anchor.Link href="#contextmenu-title" title="ContextMenu 右键菜单事件示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#contextmenu-event-list" title="可用事件列表" />
          <Anchor.Link href="#contextmenu-event-object-section" title="事件对象属性" />
        </Anchor>
      </div>
    </div>
  );
};

export default ContextMenuExample;

