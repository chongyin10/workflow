import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Button } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
} from './components/CodeEditor';
import './styles/panel.css';

// 网格配置选项表格数据
const gridOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 120 },
  { title: '类型', dataIndex: 'type', width: 150 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const gridOptionsData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用网格' },
  { name: 'size', type: 'number', default: '20', description: '网格大小（像素）' },
  { name: 'color', type: 'string', default: "'#e5e7eb'", description: '网格颜色（CSS 颜色值）' },
  { name: 'type', type: "'mesh' | 'dot'", default: "'mesh'", description: "网格类型：mesh 为线状网格，dot 为点状网格" },
];

// 网格方法表格数据
const gridMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 220 },
  { title: '参数', dataIndex: 'params', width: 200 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const gridMethodsData = [
  { key: '1', name: 'setGridEnabled(enabled)', params: 'enabled: boolean', return: 'void', description: '启用或禁用网格显示' },
  { key: '2', name: 'setGridSize(size)', params: 'size: number', return: 'void', description: '设置网格大小' },
  { key: '3', name: 'setGridColor(color)', params: 'color: string', return: 'void', description: '设置网格颜色' },
  { key: '4', name: 'setGridType(type)', params: "type: 'mesh' | 'dot'", return: 'void', description: '设置网格类型' },
  { key: '5', name: 'getGridConfig()', params: '-', return: '{ enabled, size, color, type }', description: '获取当前网格配置' },
];

// 示例 1: 线状网格
const EXAMPLE_1_CODE = `// 示例 1: 线状网格 (Mesh)
// 创建 Graph 画布，使用默认的线状网格
const graph = new Graph({
  container: container,
  draggable: true,
  scalable: true,
  backgroundColor: '#ffffff',
  grid: {
    enabled: true,
    size: 20,
    color: '#d1d5db',
    type: 'mesh', // 线状网格（默认值）
  },
});

// 添加示例节点
const node1 = graph.addNode({
  id: 'node-1',
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
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '处理',
  x: 350,
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

const node3 = graph.addNode({
  id: 'node-3',
  label: '结束',
  x: 550,
  y: 200,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

// 添加连接
node1.addPort({ id: 'port1-right', position: 'right' });
node2.addPort({ id: 'port2-left', position: 'left' });
node2.addPort({ id: 'port2-right', position: 'right' });
node3.addPort({ id: 'port3-left', position: 'left' });

graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-1', portId: 'port1-right' },
  target: { nodeId: 'node-2', portId: 'port2-left' },
});

graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'node-2', portId: 'port2-right' },
  target: { nodeId: 'node-3', portId: 'port3-left' },
});`;

// 示例 2: 点状网格
const EXAMPLE_2_CODE = `// 示例 2: 点状网格 (Dot)
// 创建 Graph 画布，使用点状网格
const graph = new Graph({
  container: container,
  draggable: true,
  scalable: true,
  backgroundColor: '#ffffff',
  grid: {
    enabled: true,
    size: 20,
    color: '#9ca3af',
    type: 'dot', // 点状网格
  },
});

// 添加示例节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '输入',
  x: 150,
  y: 200,
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
  label: '转换',
  x: 350,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#06b6d4',
    borderColor: '#0891b2',
    textColor: '#ffffff',
  },
});

const node3 = graph.addNode({
  id: 'node-3',
  label: '输出',
  x: 550,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
  },
});

// 添加连接
node1.addPort({ id: 'port1-right', position: 'right' });
node2.addPort({ id: 'port2-left', position: 'left' });
node2.addPort({ id: 'port2-right', position: 'right' });
node3.addPort({ id: 'port3-left', position: 'left' });

graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-1', portId: 'port1-right' },
  target: { nodeId: 'node-2', portId: 'port2-left' },
});

graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'node-2', portId: 'port2-right' },
  target: { nodeId: 'node-3', portId: 'port3-left' },
});`;

// 示例 3: 动态切换网格
const EXAMPLE_3_CODE = `// 示例 3: 动态切换网格类型
// 创建 Graph 画布
const graph = new Graph({
  container: container,
  draggable: true,
  scalable: true,
  backgroundColor: '#ffffff',
  grid: {
    enabled: true,
    size: 25,
    color: '#6b7280',
    type: 'mesh',
  },
});

// 添加节点
const centerNode = graph.addNode({
  id: 'center',
  label: '中心',
  x: 300,
  y: 200,
  shape: Shape.Circle,
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

// 添加周围的节点
const positions = [
  { id: 'top', label: '上', x: 300, y: 50 },
  { id: 'right', label: '右', x: 500, y: 200 },
  { id: 'bottom', label: '下', x: 300, y: 350 },
  { id: 'left', label: '左', x: 100, y: 200 },
];

positions.forEach(pos => {
  const node = graph.addNode({
    id: pos.id,
    label: pos.label,
    x: pos.x,
    y: pos.y,
    shape: Shape.Rect,
    style: {
      width: 80,
      height: 50,
      backgroundColor: '#10b981',
      borderColor: '#059669',
      textColor: '#ffffff',
    },
  });
});

// 创建日志显示区域
const logContainer = document.createElement('div');
logContainer.style.cssText = 'position:absolute;bottom:8px;left:8px;right:8px;height:80px;background:#1e293b;color:#e2e8f0;padding:8px;borderRadius:6px;overflow:auto;fontSize:12px;fontFamily:monospace;zIndex:10;';
container.appendChild(logContainer);

const addLog = (msg) => {
  const line = document.createElement('div');
  line.textContent = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
};

// 演示动态切换网格类型
let currentType = 'mesh';
addLog('当前网格类型: mesh (线状)');

// 每3秒自动切换一次网格类型
const intervalId = setInterval(() => {
  currentType = currentType === 'mesh' ? 'dot' : 'mesh';
  graph.setGridType(currentType);
  addLog(\`切换网格类型: \${currentType} (\${currentType === 'mesh' ? '线状' : '点状'})\`);
}, 3000);

// 清理定时器
window.gridIntervalId = intervalId;
addLog('每3秒自动切换网格类型...');`;

// 示例 4: 网格大小和颜色
const EXAMPLE_4_CODE = `// 示例 4: 自定义网格大小和颜色
// 创建 Graph 画布
const graph = new Graph({
  container: container,
  draggable: true,
  scalable: true,
  backgroundColor: '#1e293b', // 深色背景
  grid: {
    enabled: true,
    size: 30, // 较大的网格
    color: '#374151', // 深色网格线
    type: 'mesh',
  },
});

// 添加浅色节点（在深色背景上更醒目）
const nodes = [
  { id: 'node-1', label: 'A', x: 150, y: 150, color: '#3b82f6' },
  { id: 'node-2', label: 'B', x: 300, y: 250, color: '#22c55e' },
  { id: 'node-3', label: 'C', x: 450, y: 150, color: '#f59e0b' },
  { id: 'node-4', label: 'D', x: 300, y: 100, color: '#ec4899' },
];

nodes.forEach(n => {
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
      borderColor: n.color,
      textColor: '#ffffff',
    },
  });
});

// 将 graph 实例暴露到 window 以便外部控制
window.currentGraph = graph;`;

// 示例 5: 禁用网格
const EXAMPLE_5_CODE = `// 示例 5: 禁用/启用网格
// 创建 Graph 画布，初始禁用网格
const graph = new Graph({
  container: container,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: {
    enabled: false, // 初始禁用网格
    size: 20,
    color: '#d1d5db',
    type: 'mesh',
  },
});

// 添加节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '节点 1',
  x: 200,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
    textColor: '#ffffff',
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '节点 2',
  x: 400,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
    textColor: '#ffffff',
  },
});

// 添加连接
node1.addPort({ id: 'port1-right', position: 'right' });
node2.addPort({ id: 'port2-left', position: 'left' });

graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-1', portId: 'port1-right' },
  target: { nodeId: 'node-2', portId: 'port2-left' },
});

// 创建控制按钮
const buttonContainer = document.createElement('div');
buttonContainer.style.cssText = 'position:absolute;top:8px;right:8px;display:flex;gap:8px;zIndex:10;';
container.appendChild(buttonContainer);

const toggleBtn = document.createElement('button');
toggleBtn.textContent = '显示网格';
toggleBtn.style.cssText = 'padding:8px 16px;background:#3b82f6;color:#fff;border:none;borderRadius:6px;cursor:pointer;fontSize:13px;';
toggleBtn.onclick = () => {
  const config = graph.getGridConfig();
  graph.setGridEnabled(!config.enabled);
  toggleBtn.textContent = config.enabled ? '显示网格' : '隐藏网格';
};
buttonContainer.appendChild(toggleBtn);

// 获取当前配置按钮
const configBtn = document.createElement('button');
configBtn.textContent = '获取配置';
configBtn.style.cssText = 'padding:8px 16px;background:#6b7280;color:#fff;border:none;borderRadius:6px;cursor:pointer;fontSize:13px;';
configBtn.onclick = () => {
  const config = graph.getGridConfig();
  console.log('当前网格配置:', config);
  alert(\`网格配置:\\n- 启用: \${config.enabled}\\n- 大小: \${config.size}\\n- 颜色: \${config.color}\\n- 类型: \${config.type}\`);
};
buttonContainer.appendChild(configBtn);`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '线状网格', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '点状网格', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '动态切换', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '自定义样式', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '禁用/启用', code: EXAMPLE_5_CODE },
];

/**
 * GridExample - 网格类型示例组件
 * 展示如何使用网格的 type 属性切换线状网格和点状网格
 */
export default function GridExample() {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  // 执行用户代码并渲染 Graph
  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    // 清理之前的定时器
    if ((window as any).gridIntervalId) {
      clearInterval((window as any).gridIntervalId);
      (window as any).gridIntervalId = null;
    }

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph, Shape } = await import('../core');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
        window,
        document,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, window, document } = sandbox;
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

    return () => {
      // 清理定时器
      if ((window as any).gridIntervalId) {
        clearInterval((window as any).gridIntervalId);
      }
    };
  }, [executeCode]);

  // 网格设置控件（仅示例4显示）
  const gridSettingsToolbar = currentExample === 3 && (
    <PanelToolbar>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>网格设置：</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, color: '#64748b' }}>大小:</label>
          <input
            type="range"
            min="10"
            max="50"
            defaultValue="30"
            style={{ width: 100 }}
            onChange={(e) => {
              const size = parseInt(e.target.value);
              if ((window as any).currentGraph) {
                (window as any).currentGraph.setGridSize(size);
              }
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, color: '#64748b' }}>类型:</label>
          <select
            defaultValue="mesh"
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db' }}
            onChange={(e) => {
              if ((window as any).currentGraph) {
                (window as any).currentGraph.setGridType(e.target.value);
              }
            }}
          >
            <option value="mesh">线状</option>
            <option value="dot">点状</option>
          </select>
        </div>
      </div>
    </PanelToolbar>
  );

  // 左侧面板 - 图例展示
  const LeftPanel = (
    <Panel>
      <PanelHeader title="网格预览" />
      <div
        ref={graphContainerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      />
      {gridSettingsToolbar}
    </Panel>
  );

  // 右侧面板 - 代码编辑
  const RightPanel = (
    <Panel>
      <PanelHeader title="代码编辑" />
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
      <PanelHeader title="API 文档" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div id="grid-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Grid 配置选项 (GraphOptions.grid)
          </h3>
          <Table columns={gridOptionsColumns} dataSource={gridOptionsData} pagination={false} />
        </div>
        <div id="grid-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Grid 相关方法
          </h3>
          <Table columns={gridMethodsColumns} dataSource={gridMethodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="grid-example-title" style={{ height: '550px' }}>
        <PanelHeader title="网格类型示例" />
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
    </div>
  );
}
