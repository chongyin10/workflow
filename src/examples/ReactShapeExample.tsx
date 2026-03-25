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

// ==================== API 文档数据 ====================

// ReactShapeConfig 配置表格
const configColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 100 },
  { title: '说明', dataIndex: 'description' },
];

const configData = [
  { name: 'shape', type: 'string', required: '是', default: '-', description: '形状名称（唯一标识）' },
  { name: 'width', type: 'number', required: '否', default: '200', description: '默认宽度' },
  { name: 'height', type: 'number', required: '否', default: '100', description: '默认高度' },
  { name: 'component', type: 'React.ComponentType', required: '是', default: '-', description: 'React 组件' },
  { name: 'style', type: 'Partial<NodeStyle>', required: '否', default: '{}', description: '自定义样式' },
  { name: 'resizable', type: 'boolean', required: '否', default: 'false', description: '是否可调整大小' },
  { name: 'ports', type: 'ReactShapePortConfig[]', required: '否', default: '[]', description: '连接桩配置' },
];

// ReactNodeProps 属性表格
const propsColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const propsData = [
  { name: 'nodeId', type: 'string', description: '节点 ID' },
  { name: 'data', type: 'Record<string, any>', description: '节点自定义数据' },
  { name: 'position', type: '{ x: number; y: number }', description: '节点位置' },
  { name: 'selected', type: 'boolean', description: '节点是否被选中' },
  { name: 'hovered', type: 'boolean', description: '节点是否悬停' },
  { name: 'graph', type: 'Graph', description: 'Graph 实例引用' },
  { name: 'node', type: 'ReactShapeNode', description: '节点实例引用' },
];

// 方法表格
const methodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 250 },
  { title: '参数', dataIndex: 'params', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const methodsData = [
  { name: 'register(config)', params: 'config: ReactShapeConfig', description: '简洁 API，注册 React 形状（推荐使用）' },
  { name: 'Graph.register(config)', params: 'config: ReactShapeConfig', description: '静态方法，注册自定义形状' },
  { name: 'Graph.unregister(shapeName)', params: 'shapeName: string', description: '静态方法，注销形状' },
  { name: 'Graph.hasRegisteredShape(shapeName)', params: 'shapeName: string', description: '检查形状是否已注册' },
  { name: 'reactShapePlugin.register(config)', params: 'config: ReactShapeConfig', description: '插件实例方法，注册形状' },
  { name: 'graph.addReactNode(options)', params: 'options: { shape, x, y, ... }', description: '添加 React 节点（推荐使用）' },
  { name: 'graph.addNode(options)', params: 'options: { shape, x, y, ... }', description: '添加节点（支持 React 形状，自动识别）' },
];

// ==================== 示例代码 ====================

// 示例 1: 基础用法
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 安装 ReactShape 插件
const reactShapePlugin = new ReactShape();
graph.use(reactShapePlugin);

// 定义用户卡片组件
const UserCard = ({ data, selected }) =>
  React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      padding: '12px',
      boxSizing: 'border-box',
      background: selected ? '#e0f2fe' : '#fff',
      border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'grab',
    }
  }, [
    React.createElement('div', {
      key: 'avatar',
      style: {
        width: 40, height: 40, borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 16, fontWeight: 'bold',
      }
    }, data?.name?.charAt(0) || 'U'),
    React.createElement('div', { key: 'info' }, [
      React.createElement('div', { key: 'name', style: { fontSize: 14, fontWeight: 600 } }, data?.name || 'User'),
      React.createElement('div', { key: 'role', style: { fontSize: 12, color: '#6b7280' } }, data?.role || 'Member'),
    ]),
  ]);

// 注册 React 形状
reactShapePlugin.register({
  shape: 'user-card',
  width: 200,
  height: 80,
  component: UserCard,
});

// 添加 React 节点
graph.addReactNode({
  shape: 'user-card',
  id: 'user-1',
  x: 150,
  y: 120,
  data: { name: '张三', role: '前端工程师' },
});

graph.addReactNode({
  shape: 'user-card',
  id: 'user-2',
  x: 150,
  y: 240,
  data: { name: '李四', role: '后端工程师' },
});`;

// 示例 2: 状态节点
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 安装 ReactShape 插件
const reactShapePlugin = new ReactShape();
graph.use(reactShapePlugin);

// 定义状态节点组件
const StatusNode = ({ data, selected }) => {
  const colors = {
    success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  };
  const status = data?.status || 'info';
  const c = colors[status];

  return React.createElement('div', {
    style: {
      width: '100%', height: '100%', padding: 16, boxSizing: 'border-box',
      background: c.bg, border: '2px solid ' + (selected ? '#3b82f6' : c.border),
      borderRadius: 8, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'grab',
    }
  }, [
    React.createElement('div', { key: 'icon', style: { fontSize: 24 } }, data?.icon || '📊'),
    React.createElement('div', { key: 'label', style: { fontSize: 14, fontWeight: 600, color: c.text } },
      data?.label || 'Status'
    ),
  ]);
};

// 注册状态节点
reactShapePlugin.register({
  shape: 'status-node',
  width: 120,
  height: 100,
  component: StatusNode,
});

// 添加不同状态的节点
graph.addReactNode({
  shape: 'status-node', id: 'status-1', x: 150, y: 120,
  data: { status: 'success', label: '已完成', icon: '✅' },
});

graph.addReactNode({
  shape: 'status-node', id: 'status-2', x: 320, y: 120,
  data: { status: 'warning', label: '进行中', icon: '⏳' },
});

graph.addReactNode({
  shape: 'status-node', id: 'status-3', x: 490, y: 120,
  data: { status: 'error', label: '失败', icon: '❌' },
});

graph.addReactNode({
  shape: 'status-node', id: 'status-4', x: 150, y: 260,
  data: { status: 'info', label: '待处理', icon: 'ℹ️' },
});`;

// 示例 3: 进度条节点
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 安装 ReactShape 插件
const reactShapePlugin = new ReactShape();
graph.use(reactShapePlugin);

// 定义进度条组件
const ProgressNode = ({ data, selected }) => {
  const progress = Math.min(100, Math.max(0, data?.progress || 0));
  return React.createElement('div', {
    style: {
      width: '100%', height: '100%', padding: 12, boxSizing: 'border-box',
      background: '#fff', border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'grab',
    }
  }, [
    React.createElement('div', { key: 'title', style: { fontSize: 12, fontWeight: 500, color: '#374151' } },
      data?.title || 'Progress'
    ),
    React.createElement('div', { key: 'bar-bg', style: { flex: 1, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' } },
      React.createElement('div', {
        style: {
          width: progress + '%', height: '100%',
          background: progress >= 100 ? '#10b981' : '#3b82f6',
          borderRadius: 4, transition: 'width 0.3s ease',
        }
      })
    ),
    React.createElement('div', { key: 'percent', style: { fontSize: 11, color: '#6b7280', textAlign: 'right' } },
      progress + '%'
    ),
  ]);
};

// 注册进度条节点
reactShapePlugin.register({
  shape: 'progress-node',
  width: 180,
  height: 80,
  component: ProgressNode,
});

// 添加不同进度的节点
graph.addReactNode({
  shape: 'progress-node', id: 'progress-1', x: 150, y: 100,
  data: { title: '任务 A', progress: 25 },
});

graph.addReactNode({
  shape: 'progress-node', id: 'progress-2', x: 380, y: 100,
  data: { title: '任务 B', progress: 60 },
});

graph.addReactNode({
  shape: 'progress-node', id: 'progress-3', x: 150, y: 220,
  data: { title: '任务 C', progress: 85 },
});

graph.addReactNode({
  shape: 'progress-node', id: 'progress-4', x: 380, y: 220,
  data: { title: '任务 D', progress: 100 },
});`;

// 示例 4: 带连接桩的节点
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 安装 ReactShape 插件
const reactShapePlugin = new ReactShape();
graph.use(reactShapePlugin);

// 定义处理节点组件
const ProcessNode = ({ data, selected }) =>
  React.createElement('div', {
    style: {
      width: '100%', height: '100%', padding: 16, boxSizing: 'border-box',
      background: selected ? '#fef3c7' : '#fff',
      border: selected ? '2px solid #f59e0b' : '1px solid #e5e7eb',
      borderRadius: 8, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'grab',
    }
  }, [
    React.createElement('div', { key: 'icon', style: { fontSize: 20 } }, data?.icon || '⚙️'),
    React.createElement('div', { key: 'label', style: { fontSize: 13, fontWeight: 600, color: '#374151' } },
      data?.label || 'Process'
    ),
  ]);

// 注册带连接桩的节点
reactShapePlugin.register({
  shape: 'process-node',
  width: 120,
  height: 90,
  component: ProcessNode,
  ports: [
    { id: 'in', position: 'left', label: '输入' },
    { id: 'out', position: 'right', label: '输出' },
  ],
});

// 添加节点
graph.addReactNode({
  shape: 'process-node', id: 'node-1', x: 150, y: 150,
  data: { label: '输入处理', icon: '📥' },
});

graph.addReactNode({
  shape: 'process-node', id: 'node-2', x: 350, y: 150,
  data: { label: '数据转换', icon: '🔄' },
});

graph.addReactNode({
  shape: 'process-node', id: 'node-3', x: 550, y: 150,
  data: { label: '输出处理', icon: '📤' },
});

// 添加连接
const node1 = graph.getNode('node-1');
const node2 = graph.getNode('node-2');
const node3 = graph.getNode('node-3');

if (node1 && node2) {
  node1.addPort({ id: 'out', position: 'right' });
  node2.addPort({ id: 'in', position: 'left' });
  graph.addEdge({
    id: 'edge-1',
    source: { nodeId: 'node-1', portId: 'out' },
    target: { nodeId: 'node-2', portId: 'in' },
  });
}

if (node2 && node3) {
  node2.addPort({ id: 'out', position: 'right' });
  node3.addPort({ id: 'in', position: 'left' });
  graph.addEdge({
    id: 'edge-2',
    source: { nodeId: 'node-2', portId: 'out' },
    target: { nodeId: 'node-3', portId: 'in' },
  });
}`;

// 示例 5: 使用 Graph.register 静态方法
const EXAMPLE_5_CODE = `// 使用 Graph.register 静态方法注册形状
// 注意：这种方式注册的形状会被所有 Graph 实例共享

Graph.register({
  shape: 'custom-rect',
  width: 150,
  height: 80,
  style: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderRadius: 8,
  },
});

// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 直接使用注册的形状添加节点
graph.addNode({
  id: 'static-1',
  shape: 'custom-rect',
  label: '静态注册形状',
  x: 200,
  y: 150,
});

graph.addNode({
  id: 'static-2',
  shape: 'custom-rect',
  label: '另一个节点',
  x: 450,
  y: 150,
});

// 检查形状是否已注册
console.log('已注册形状:', Graph.getRegisteredShapes());
console.log('custom-rect 已注册:', Graph.hasRegisteredShape('custom-rect'));`;

// 示例 6: 新的简洁 API（reactShapePlugin.register + graph.addNode）
const EXAMPLE_6_CODE = `// 使用插件实例方法注册 React 形状
// 无需手动调用 addReactNode，直接使用 graph.addNode

// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 350,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 安装 ReactShape 插件
const reactShapePlugin = new ReactShape();
graph.use(reactShapePlugin);

// 定义 React 组件
const NodeComponent = ({ data, selected }) =>
  React.createElement('div', {
    className: 'react-node',
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      boxSizing: 'border-box',
      background: selected ? '#e0f2fe' : '#fff',
      border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      color: '#374151',
      cursor: 'grab',
    }
  }, data?.label || 'React Node');

// 注册 React 形状（使用插件实例方法）
reactShapePlugin.register({
  shape: 'custom-basic-react-node',
  width: 140,
  height: 80,
  component: NodeComponent,
});

// 直接使用 graph.addNode 添加 React 节点（简洁！）
graph.addNode({
  id: 'node-a',
  shape: 'custom-basic-react-node',
  x: 100,
  y: 100,
  data: { label: '节点 A' },
});

graph.addNode({
  id: 'node-b',
  shape: 'custom-basic-react-node',
  x: 300,
  y: 150,
  data: { label: '节点 B' },
});

graph.addNode({
  id: 'node-c',
  shape: 'custom-basic-react-node',
  x: 500,
  y: 100,
  data: { label: '节点 C' },
});`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础用法', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '状态节点', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '进度条', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '连接桩', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '静态注册', code: EXAMPLE_5_CODE },
  { id: 'example-6', title: '简洁 API', code: EXAMPLE_6_CODE },
];

/**
 * ReactShapeExample - React Shape 插件使用示例
 */
export const ReactShapeExample: React.FC = () => {
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
      const { Graph } = await import('../core/Graph');
      const { ReactShape } = await import('../plugins/ReactShape');
      const React = await import('react');

      // 创建容器样式
      const container = graphContainerRef.current;
      container.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
      `;

      const sandbox = {
        container,
        console: window.console,
        Graph,
        React: React.default,
        ReactShape,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, React, ReactShape } = sandbox;
        ${codeToExecute}
      `;

      const fn = new Function('sandbox', executableCode);
      fn(sandbox);
    } catch (error) {
      console.error('代码执行错误:', error);
      // 在容器中显示错误信息
      if (graphContainerRef.current) {
        graphContainerRef.current.innerHTML = `
          <div style="
            padding: 20px;
            color: #ef4444;
            font-family: monospace;
            font-size: 14px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            margin: 16px;
          ">
            <div style="font-weight: bold; margin-bottom: 8px;">❌ 代码执行错误</div>
            <div>${error instanceof Error ? error.message : String(error)}</div>
          </div>
        `;
      }
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
      <PanelHeader icon="⚛️" title="React Shape 预览" hint="编辑代码后点击运行" />
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
        <div id="config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ReactShapeConfig - 注册配置
          </h3>
          <Table columns={configColumns} dataSource={configData} pagination={false} />
        </div>
        <div id="props-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            ReactNodeProps - 组件属性
          </h3>
          <Table columns={propsColumns} dataSource={propsData} pagination={false} />
        </div>
        <div id="methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            方法列表
          </h3>
          <Table columns={methodsColumns} dataSource={methodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="react-shape-title" style={{ height: '600px' }}>
        <PanelHeader title="React Shape 示例" />
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
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: currentExample === index ? '#3b82f6' : '#ffffff',
                  color: currentExample === index ? '#ffffff' : '#64748b',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                }}
              >
                {ex.title}
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
    </div>
  );
};

export default ReactShapeExample;
